import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
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
  public static validateAndBuild(
    incomingSimulateRawEventRequestInput: IncomingSimulateRawEventRequestInput,
  ): Success<IncomingSimulateRawEventRequest> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingSimulateRawEventRequest.validateAndBuild'
    console.info(`${logContext} init:`, { incomingSimulateRawEventRequestInput })

    const propsResult = this.buildProps(incomingSimulateRawEventRequestInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, incomingSimulateRawEventRequestInput })
      return propsResult
    }

    const { pk, sk, eventName, eventData, createdAt, updatedAt } = propsResult.value
    const incomingSimulateRawEventRequest = new IncomingSimulateRawEventRequest(
      pk,
      sk,
      eventName,
      eventData,
      createdAt,
      updatedAt,
    )
    const incomingSimulateRawEventRequestResult = Result.makeSuccess(incomingSimulateRawEventRequest)
    console.info(`${logContext} exit success:`, {
      incomingSimulateRawEventRequestResult,
      incomingSimulateRawEventRequestInput,
    })
    return incomingSimulateRawEventRequestResult
  }

  //
  //
  //
  private static buildProps(
    incomingSimulateRawEventRequestInput: IncomingSimulateRawEventRequestInput,
  ): Success<EventProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(incomingSimulateRawEventRequestInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { pk, sk, eventName, eventData, createdAt, updatedAt } = incomingSimulateRawEventRequestInput
    const incomingSimulateRawEventRequestProps: IncomingSimulateRawEventRequestProps = {
      pk,
      sk,
      eventName,
      eventData,
      createdAt,
      updatedAt,
    }
    return Result.makeSuccess(incomingSimulateRawEventRequestProps)
  }

  //
  //
  //
  private static validateInput(
    incomingSimulateRawEventRequestInput: EventProps,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingSimulateRawEventRequest.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      pk: z.string().trim().min(1),
      sk: z.string().trim().min(1),
      eventName: z.string().trim().min(1),
      eventData: z.any().optional(),
      createdAt: z.string().optional(),
      updatedAt: z.string().optional(),
    })

    try {
      schema.strict().parse(incomingSimulateRawEventRequestInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, incomingSimulateRawEventRequestInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, incomingSimulateRawEventRequestInput })
      return invalidArgsFailure
    }
  }
}
