import wallet from '../core'
import Broker from '../broker'
import { appModule } from './modules/app'

wallet.original.registerModule('app', appModule)

const brokerCreator = Broker(wallet.original.state)

export const broker = brokerCreator.plugin(wallet.original)

export default wallet.original
