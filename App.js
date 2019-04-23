import React, {Component} from 'react'
import {Text, View, TouchableOpacity, FlatList, SafeAreaView,
  NativeEventEmitter, NativeModules, Platform, PermissionsAndroid} from 'react-native'
import styles from './src/styles'
import {
  startBle, scanPeripherals, connectToPeripheral,
  disconnectPeripherals, checkIfPeripheralConnected,
  writeOnService
} from './src/utils/ble'
import {hexToBytes} from 'convert-hex'

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default class App extends Component {
  state = {
    devices: [],
    device: null,
    scanning: false,
    services: [],
    characteristics: [],
    advertisedData: null,
    isDeviceConnected: null
  }

  componentDidMount() {
    startBle()

    this.handlerUpdate = bleManagerEmitter.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      this.handleUpdateValueForCharacteristic
    )

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
      ).then((result) => {
        if (result) {
          console.log("Permission is OK")
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
          ).then((result) => {
            if (result) {
              console.log("User accept")
            } else {
              console.log("User refuse")
            }
          });
        }
      });
    }
  }

  componentWillUnmount() {
    this.handlerUpdate.remove()
  }

  handleUpdateValueForCharacteristic = (data) => {
    const {value, peripheral, characteristic} = data
    console.log(
      `Received data from ${peripheral}, 
      characteristic ${characteristic}, ${value}`
    )
    this.setState({advertisedData: value})
  }

  keyExtractor = (message, index) => {
    return String(index)
  }

  renderDevices = ({item}) => {
    return (
      <View style={styles.listWrapper}>
        <View style={styles.shadow}>
          <TouchableOpacity onPress={() => this.handleConnectPress(item.name, item.id)}>
            <Text>ID: {item.id}</Text>
            <Text>NAME: {item.name}</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  renderCharacteristic = ({item}) => {
    const {device} = this.state
    const randomHexData = hexToBytes('00')

    return (
      <View style={styles.listWrapper}>
        <View style={styles.shadow}>
          <TouchableOpacity onPress={
            () => writeOnService(device.uuid, item.service, item.characteristic, randomHexData)
          }>
            <Text>Service: {item.service}</Text>
            <Text>Characteristics: {item.characteristic}</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  handleScanPress = async () => {
    const peripheralsPromise = scanPeripherals()

    this.setState({scanning: true})

    const peripherals = await peripheralsPromise
      .catch((error) => {
        this.setState({scanning: false})
        console.log(error)
        throw error
      })

    this.setState({
      scanning: false,
      devices: peripherals
    })

  }

  handleConnectPress = async (name, uuid) => {
    const peripheralInfo = await connectToPeripheral(name, uuid)
      .catch(error => {
        console.log('Connect to peripheral error: ', error)
        throw error
      })

    const bonded = await checkIfPeripheralConnected(uuid)

    this.setState({
      services: peripheralInfo.services,
      characteristics: peripheralInfo.characteristics,
      device: {name, uuid},
      isDeviceConnected: bonded
    })
  }

  handleDisconnectPress = async () => {
    const {device} = this.state
    await disconnectPeripherals(device.uuid, device.name)
      .catch((error) => {
        console.log(error)
        throw error
      })
    const bonded = await checkIfPeripheralConnected(device.uuid)
    this.setState({isDeviceConnected: bonded})
  }

  render() {
    const {devices, device, scanning, isDeviceConnected, advertisedData, services, characteristics} = this.state

    console.log(services)

    return (
      <View style={styles.wrapper}>
        <SafeAreaView style={{flex: 1}}>
          <Text style={styles.titleText}>BLE Example</Text>
          <TouchableOpacity onPress={this.handleScanPress}>
            <Text style={styles.text}>{scanning ? 'SCANNING...' : 'PRESS TO SCAN'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.handleDisconnectPress}>
            <Text style={styles.text}>DISCONNECT</Text>
          </TouchableOpacity>
          {isDeviceConnected ?
            <View style={{flex: 1}}>
              <Text>You are connected to {device.name}</Text>
              <Text>with uuid {device.uuid}.</Text>
            </View>
            :
          <View style={{flex: 1}}>
            <FlatList
              data={devices}
              keyExtractor={this.keyExtractor}
              renderItem={this.renderDevices}
            />
          </View>
          }
          <View style={{flex: 1}}>
            <FlatList
              data={characteristics}
              keyExtractor={this.keyExtractor}
              renderItem={this.renderCharacteristic}
            />
          </View>
          <View style={{flex: 0.3}}>
            <Text>Advertised data: {advertisedData}</Text>
          </View>
        </SafeAreaView>
      </View>
    )
  }
}
