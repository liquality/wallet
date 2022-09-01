import wallet from '../core'
import Broker from '../broker'
import { appModule } from './modules/app'
import { uiModule } from './modules/ui'

wallet.original.registerModule('app', appModule)
wallet.original.registerModule('ui', uiModule)

const brokerCreator = Broker(wallet.original.state)

export const broker = brokerCreator.plugin(wallet.original)

export default wallet.original
