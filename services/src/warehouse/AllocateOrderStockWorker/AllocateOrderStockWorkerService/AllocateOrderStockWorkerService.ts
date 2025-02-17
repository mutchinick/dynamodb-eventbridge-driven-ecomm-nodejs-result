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
    | Failure<'InvalidEventRaiseOperationError_Redundant'>
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
    | Failure<'InvalidEventRaiseOperationError_Redundant'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'AllocateOrderStockWorkerService.allocateOrderStock'
    console.info(`${logContext} init:`, { incomingOrderCreatedEvent })

    const allocateOrderResult = await this.allocateOrder(incomingOrderCreatedEvent)

    if (
      Result.isSuccess(allocateOrderResult) ||
      Result.isFailureOfKind(allocateOrderResult, 'InvalidStockAllocationOperationError_Redundant')
    ) {
      const raiseAllocatedEventResult = await this.raiseAllocatedEvent(incomingOrderCreatedEvent)
      Result.isSuccess(raiseAllocatedEventResult)
        ? console.info(`${logContext} exit success:`, { raiseAllocatedEventResult })
        : console.error(`${logContext} exit failure:`, { raiseAllocatedEventResult, incomingOrderCreatedEvent })
      return raiseAllocatedEventResult
    }

    if (Result.isFailureOfKind(allocateOrderResult, 'InvalidStockAllocationOperationError_Depleted')) {
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
  private async allocateOrder(
    incomingOrderCreatedEvent: IncomingOrderCreatedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'InvalidStockAllocationOperationError_Redundant'>
    | Failure<'InvalidStockAllocationOperationError_Depleted'>
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
    | Failure<'InvalidEventRaiseOperationError_Redundant'>
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
    | Failure<'InvalidEventRaiseOperationError_Redundant'>
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
