import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { EventProps } from './EventProps'

export type RawSimulatedEventInput = EventProps

type RawSimulatedEventProps = EventProps & { _tn: '#EVENT' }

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
    readonly _tn: '#EVENT',
  ) {}

  //
  //
  //
  public static validateAndBuild(rawSimulatedEventInput: RawSimulatedEventInput) {
    const logContext = 'RawSimulatedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { rawSimulatedEventInput })

    const propsResult = this.buildProps(rawSimulatedEventInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, rawSimulatedEventInput })
      return propsResult
    }

    const { pk, sk, eventName, eventData, createdAt, updatedAt, _tn } = propsResult.value
    const rawSimulatedEvent = new RawSimulatedEvent(pk, sk, eventName, eventData, createdAt, updatedAt, _tn)
    const rawSimulatedEventResult = Result.makeSuccess(rawSimulatedEvent)
    console.info(`${logContext} exit success:`, { rawSimulatedEventResult, rawSimulatedEventInput })
    return rawSimulatedEventResult
  }

  //
  //
  //
  private static buildProps(
    rawSimulatedEventInput: RawSimulatedEventInput,
  ): Success<RawSimulatedEventProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(rawSimulatedEventInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const date = new Date().toISOString()
    const { pk, sk, eventName, eventData, createdAt, updatedAt } = rawSimulatedEventInput
    const rawSimulatedEventProps: RawSimulatedEventProps = {
      pk,
      sk,
      eventName,
      eventData,
      createdAt: createdAt?.trim() || date,
      updatedAt: updatedAt?.trim() || date,
      _tn: '#EVENT',
    }
    return Result.makeSuccess(rawSimulatedEventProps)
  }

  //
  //
  //
  private static validateInput(
    rawSimulatedEventInput: RawSimulatedEventInput,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'RawSimulatedEvent.validateInput'

    const schema = z.object({
      pk: z.string().trim().min(1),
      sk: z.string().trim().min(1),
      eventName: z.string().trim().min(1),
      eventData: z.any().optional(),
      createdAt: z.string().optional(),
      updatedAt: z.string().optional(),
    })

    try {
      schema.strict().parse(rawSimulatedEventInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, rawSimulatedEventInput })
      return invalidArgsFailure
    }
  }
}
