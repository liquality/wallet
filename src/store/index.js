import wallet from '../core'
import Broker from '../broker'
import { appModule } from './modules/app'

wallet.original.registerModule('app', appModule)

console.log('store being created')

const broker = Broker(wallet.original.state)

broker.plugin(wallet.original)

export default wallet.original
