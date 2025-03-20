import { Failure, Result, Success } from '../../errors/Result'
import { IDbAllocateOrderStockClient } from '../DbAllocateOrderStockClient/DbAllocateOrderStockClient'
import { IEsRaiseOrderStockAllocatedEventClient } from '../EsRaiseOrderStockAllocatedEventClient/EsRaiseOrderStockAllocatedEventClient'
import { IEsRaiseOrderStockDepletedEventClient } from '../EsRaiseOrderStockDepletedEventClient/EsRaiseOrderStockDepletedEventClient'
import { AllocateOrderStockCommand, AllocateOrderStockCommandInput } from '../model/AllocateOrderStockCommand'
import { IncomingOrderCreatedEvent } from '../model/IncomingOrderCreatedEvent'
import { OrderStockAllocatedEvent } from '../model/OrderStockAllocatedEvent'
import { OrderStockDepletedEvent } from '../model/OrderStockDepletedEvent'

export interface IAllocateOrderStockWorkerService {
  allocateOrderStock: (
    incomingOrderCreatedEvent: IncomingOrderCreatedEvent,
  ) => Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'UnrecognizedError'>
  >
}

export class AllocateOrderStockWorkerService implements IAllocateOrderStockWorkerService {
  //
  //
  //
  constructor(
    private readonly dbAllocateOrderStockClient: IDbAllocateOrderStockClient,
    private readonly esRaiseOrderStockAllocatedEventClient: IEsRaiseOrderStockAllocatedEventClient,
    private readonly esRaiseOrderStockDepletedEventClient: IEsRaiseOrderStockDepletedEventClient,
  ) {}

  //
  //
  //
  public async allocateOrderStock(
    incomingOrderCreatedEvent: IncomingOrderCreatedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'AllocateOrderStockWorkerService.allocateOrderStock'
    console.info(`${logContext} init:`, { incomingOrderCreatedEvent })

    const inputValidationResult = this.validateInput(incomingOrderCreatedEvent)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, incomingOrderCreatedEvent })
      return inputValidationResult
    }

    const allocateOrderResult = await this.allocateOrder(incomingOrderCreatedEvent)

    if (
      Result.isSuccess(allocateOrderResult) ||
      Result.isFailureOfKind(allocateOrderResult, 'DuplicateStockAllocationError')
    ) {
      const raiseAllocatedEventResult = await this.raiseAllocatedEvent(incomingOrderCreatedEvent)
      Result.isSuccess(raiseAllocatedEventResult)
        ? console.info(`${logContext} exit success:`, { raiseAllocatedEventResult })
        : console.error(`${logContext} exit failure:`, { raiseAllocatedEventResult, incomingOrderCreatedEvent })
      return raiseAllocatedEventResult
    }

    if (Result.isFailureOfKind(allocateOrderResult, 'DepletedStockAllocationError')) {
      const raiseDepletedEventResult = await this.raiseDepletedEvent(incomingOrderCreatedEvent)
      Result.isSuccess(raiseDepletedEventResult)
        ? console.info(`${logContext} exit success:`, { raiseDepletedEventResult })
        : console.error(`${logContext} exit failure:`, { raiseDepletedEventResult, incomingOrderCreatedEvent })
      return raiseDepletedEventResult
    }

    console.error(`${logContext} exit failure:`, { allocateOrderResult, incomingOrderCreatedEvent })
    return allocateOrderResult
  }

  //
  //
  //
  private validateInput(
    incomingOrderCreatedEvent: IncomingOrderCreatedEvent,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'AllocateOrderStockWorkerService.validateInput'
    console.info(`${logContext} init:`, { incomingOrderCreatedEvent })

    if (incomingOrderCreatedEvent instanceof IncomingOrderCreatedEvent === false) {
      const errorMessage = `Expected IncomingOrderCreatedEvent but got ${incomingOrderCreatedEvent}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, incomingOrderCreatedEvent })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  //
  //
  //
  private async allocateOrder(
    incomingOrderCreatedEvent: IncomingOrderCreatedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateStockAllocationError'>
    | Failure<'DepletedStockAllocationError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'AllocateOrderStockWorkerService.allocateOrder'
    console.info(`${logContext} init:`, { incomingOrderCreatedEvent })

    const allocateOrderStockCommandInput: AllocateOrderStockCommandInput = { incomingOrderCreatedEvent }
    const allocateOrderStockCommandResult = AllocateOrderStockCommand.validateAndBuild(allocateOrderStockCommandInput)

    if (Result.isFailure(allocateOrderStockCommandResult)) {
      console.error(`${logContext} exit failure:`, { allocateOrderStockCommandResult, allocateOrderStockCommandInput })
      return allocateOrderStockCommandResult
    }

    const allocateOrderStockCommand = allocateOrderStockCommandResult.value
    const allocateOrderStockResult = await this.dbAllocateOrderStockClient.allocateOrderStock(allocateOrderStockCommand)

    Result.isSuccess(allocateOrderStockResult)
      ? console.info(`${logContext} exit success:`, { allocateOrderStockResult })
      : console.error(`${logContext} exit failure:`, { allocateOrderStockResult, allocateOrderStockCommand })

    return allocateOrderStockResult
  }

  //
  //
  //
  private async raiseAllocatedEvent(
    incomingOrderCreatedEvent: IncomingOrderCreatedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'AllocateOrderStockWorkerService.raiseAllocatedEvent'
    console.info(`${logContext} init:`, { incomingOrderCreatedEvent })

    const { eventData } = incomingOrderCreatedEvent
    const orderStockAllocatedEventResult = OrderStockAllocatedEvent.validateAndBuild(eventData)

    if (Result.isFailure(orderStockAllocatedEventResult)) {
      console.error(`${logContext} exit failure:`, { orderStockAllocatedEventResult, eventData })
      return orderStockAllocatedEventResult
    }

    const orderStockAllocatedEvent = orderStockAllocatedEventResult.value
    const raiseEventResult =
      await this.esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(orderStockAllocatedEvent)

    Result.isSuccess(raiseEventResult)
      ? console.info(`${logContext} exit success:`, { raiseEventResult })
      : console.error(`${logContext} exit failure:`, { raiseEventResult, orderStockAllocatedEvent })

    return raiseEventResult
  }

  //
  //
  //
  private async raiseDepletedEvent(
    incomingOrderCreatedEvent: IncomingOrderCreatedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'AllocateOrderStockWorkerService.raiseDepletedEvent'
    console.info(`${logContext} init:`, { incomingOrderCreatedEvent })

    const { eventData } = incomingOrderCreatedEvent
    const orderStockDepletedEventResult = OrderStockDepletedEvent.validateAndBuild(eventData)

    if (Result.isFailure(orderStockDepletedEventResult)) {
      console.error(`${logContext} exit failure:`, { orderStockDepletedEventResult, eventData })
      return orderStockDepletedEventResult
    }

    const orderStockDepletedEvent = orderStockDepletedEventResult.value
    const raiseEventResult =
      await this.esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(orderStockDepletedEvent)

    Result.isSuccess(raiseEventResult)
      ? console.info(`${logContext} exit success:`, { raiseEventResult })
      : console.error(`${logContext} exit failure:`, { raiseEventResult, orderStockDepletedEvent })

    return raiseEventResult
  }
}
