import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import * as middy from 'middy'

const logger = createLogger('auth')

const jwksUrl = 'https://dev-gx7-zn1y.us.auth0.com/.well-known/jwks.json'

export const handler = middy(async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
})

const verifyToken = async (authHeader: string): Promise<JwtPayload> => {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  const response = await Axios.get(jwksUrl)

  const keys: any[] = response.data.keys
  if (!keys || !keys.length) throw new Error('The JWKS endpoint did not contain any keys')

  const signingKeys = keys.find(key => key.kid === jwt.header.kid)
  if (!signingKeys) throw new Error(`Unable to find a signing key that matches: ${jwt.header.kid}`)

  const certification = certToPem(signingKeys.x5c[0])

  return verify(token, certification, { algorithms: ['RS256'] }) as JwtPayload
}

const getToken = (authHeader: string): string => {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  return authHeader.split(' ')[1]
}

const certToPem = (certVal: string): string => {
  certVal = certVal.match(/.{1,64}/g).join('\n')
  return `-----BEGIN CERTIFICATE-----\n${certVal}\n-----END CERTIFICATE-----\n`
}
