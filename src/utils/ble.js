import {Platform} from 'react-native'
import BleManager from 'react-native-ble-manager'

const delay = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const startBle = () => BleManager.start()

export const scanPeripherals = async () => {
  await BleManager.scan([], 2, true)
  console.log('Scan started!')

  await delay(2e3)
  return BleManager.getDiscoveredPeripherals([])
}

export const connectToPeripheral = async (name, uuid) => {
  const isConnected = await checkIfPeripheralConnected(uuid)

  if (!isConnected) {
    await BleManager.connect(uuid)
    console.log(`${name} has just connected!`)

    const peripheralInfo = await BleManager.retrieveServices(uuid)
    const service = Platform.OS === 'ios' ?
      peripheralInfo.characteristics[0].service :
      peripheralInfo.characteristics[4].service
    const characteristic = Platform.OS === 'ios' ?
      peripheralInfo.characteristics[0].characteristic :
      peripheralInfo.characteristics[4].characteristic
    console.log(`${service} service has been retrieved!`)

    await BleManager.startNotification(uuid, service, characteristic)
    return peripheralInfo
  } else {
    console.log(`${name} is already connected - no need to reconnect!`)
  }
}

export const disconnectPeripherals = async (uuid, name) => {
  await BleManager.disconnect(uuid)
  console.log(`Disconnected from ${name}`)
}

export const checkIfPeripheralConnected = (uuid) => {
  return BleManager.isPeripheralConnected(uuid)
}

export const writeOnService = async (uuid, service, characteristic, hex) => {
  await BleManager.write(uuid, service, characteristic, hex)
}
