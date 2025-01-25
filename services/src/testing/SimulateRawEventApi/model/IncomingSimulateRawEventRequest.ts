import { z } from 'zod'
import { EventProps } from './EventProps'

export type IncomingSimulateRawEventRequestInput = EventProps

type IncomingSimulateRawEventRequestProps = EventProps

export class IncomingSimulateRawEventRequest implements IncomingSimulateRawEventRequestProps {
  //
  //
  //
  private constructor(
    readonly pk: string,
    readonly sk: string,
    readonly eventName: string,
    readonly eventData: unknown,
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}

  //
  //
  //
  public static validateAndBuild(input: IncomingSimulateRawEventRequestInput) {
    try {
      const { pk, sk, eventName, eventData, createdAt, updatedAt } = this.validateAndBuildProps(input)
      return new IncomingSimulateRawEventRequest(pk, sk, eventName, eventData, createdAt, updatedAt)
    } catch (error) {
      console.error('IncomingSimulateRawEventRequest.validateAndBuild', {
        error,
        incomingSimulateRawEventRequestInput: input,
      })
      throw error
    }
  }

  //
  //
  //
  private static validateAndBuildProps(
    input: IncomingSimulateRawEventRequestInput,
  ): IncomingSimulateRawEventRequestProps {
    z.object({
      pk: z.string().trim().min(1),
      sk: z.string().trim().min(1),
      eventName: z.string().trim().min(1),
      eventData: z.any().optional(),
      createdAt: z.string().optional(),
      updatedAt: z.string().optional(),
    })
      .strict()
      .parse(input)

    return input
  }
}
