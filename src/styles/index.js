import {StyleSheet} from "react-native";

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10
  },
  titleText: {
    fontSize: 25,
    color: 'red'
  },
  text: {
    fontSize: 20
  },
  listWrapper: {
    flex: 1,
    paddingTop: 15,
    paddingBottom: 5,
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  shadow: {
    shadowColor: '#000000',
    flex: 1,
    shadowOffset: {
      width: 0,
      height: 1
    },
    backgroundColor: 'white',
    shadowRadius: 10,
    shadowOpacity: 0.3,
    borderRadius: 10,
    padding: 10
  },
})

export default styles
