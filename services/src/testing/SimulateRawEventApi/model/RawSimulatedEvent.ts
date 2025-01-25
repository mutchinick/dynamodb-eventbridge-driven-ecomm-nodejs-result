import { z } from 'zod'
import { EventProps } from './EventProps'

export type RawSimulatedEventInput = EventProps

type RawSimulatedEventProps = EventProps & { _tn: 'EVENT' }

export class RawSimulatedEvent implements RawSimulatedEventProps {
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
    readonly _tn: 'EVENT',
  ) {}

  //
  //
  //
  public static validateAndBuild(input: RawSimulatedEventInput) {
    try {
      const { pk, sk, eventName, eventData, createdAt, updatedAt, _tn } = this.validateAndBuildProps(input)
      return new RawSimulatedEvent(pk, sk, eventName, eventData, createdAt, updatedAt, _tn)
    } catch (error) {
      console.error('RawSimulatedEvent.validateAndBuild', { error, input })
      throw error
    }
  }

  //
  //
  //
  private static validateAndBuildProps(input: RawSimulatedEventInput): RawSimulatedEventProps {
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

    const date = new Date().toISOString()
    const { pk, sk, eventName, eventData, createdAt, updatedAt } = input
    return {
      pk,
      sk,
      eventName,
      eventData,
      createdAt: createdAt?.trim() || date,
      updatedAt: updatedAt?.trim() || date,
      _tn: 'EVENT',
    }
  }
}
