import wallet from '../core'
import Broker from '../broker'
import { appModule } from './modules/app'

wallet.original.registerModule('app', appModule)

const broker = Broker(wallet.state)

broker.plugin(wallet.original)

export default wallet.original
