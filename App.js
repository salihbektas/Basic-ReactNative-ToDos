import React, { useState, useCallback, useEffect } from "react"

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Dimensions,
  SafeAreaView,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native"

import * as SplashScreen from "expo-splash-screen"

import AsyncStorage from "@react-native-async-storage/async-storage"

SplashScreen.preventAutoHideAsync()

function App() {
  const [items, setItems] = useState([])
  const count = items.reduce((acc, item) => (!item.done ? acc + 1 : acc), 0)
  const [text, setText] = useState("")

  const [appIsReady, setAppIsReady] = useState(false)

  useEffect(() => {
    async function prepare() {
      try {
        await AsyncStorage.getItem("@TODOS").then((data) => {
          if (data !== null) setItems(JSON.parse(data))
        })
      } catch (e) {
        console.warn(e)
      } finally {
        setAppIsReady(true)
      }
    }

    prepare()
  }, [])

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync()
    }
  }, [appIsReady])

  function handleDone(index) {
    items[index].done = !items[index].done

    let unDoneJobs = items.filter((item) => !item.done)
    let doneJobs = items.filter((item) => item.done)

    setItems([...unDoneJobs, ...doneJobs])
  }

  function handleDelete(deleteIndex) {
    let newData = items.filter((item, index) => index !== deleteIndex)

    setItems(newData)
  }

  function addItem() {
    if (text !== "") {
      let newData = [{ title: text, done: false }, ...items]
      setText("")
      setItems(newData)
    }
  }

  useEffect(() => {
    if (items)
      AsyncStorage.setItem("@TODOS", JSON.stringify(items)).catch((error) =>
        console.warn(error)
      )
  }, [items])

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safe} onLayout={onLayoutRootView}>
        <StatusBar barStyle={"light-content"} />

        <View style={styles.header}>
          <Text style={styles.headreText}>To-Do's</Text>
          <Text style={styles.headreText}>{count}</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Do ..."
            onChangeText={(input) => setText(input)}
            defaultValue={text}
          />
          <Pressable style={styles.addButton} onPress={addItem}>
            <Text style={styles.buttonText}>Add</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.scroll}>
          {!items || items.length === 0 ? (
            <View style={styles.emptyInfoView}>
              <Text style={styles.emptyInfoText}>Nothing To Do ...</Text>
            </View>
          ) : (
            items.map((item, index) => {
              return (
                <Pressable
                  onPress={() => handleDone(index)}
                  onLongPress={() => handleDelete(index)}
                  key={index}
                >
                  <View style={styles.itemLine(item.done)}>
                    <Text style={styles.lineText(item.done)}>{item.title}</Text>
                  </View>
                </Pressable>
              )
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

const dark = "#16161A"
const purple = "#7F5AF0"
const green = "#2CB67D"
const white = "#FFFFFE"
const grey = "#94A1B2"
const windowHeight = Dimensions.get("window").height

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: dark,
    padding: 8,
    justifyContent: "center"
  },

  header: {
    height: windowHeight * 0.08,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  headreText: {
    color: purple,
    fontSize: 28,
    fontWeight: "bold"
  },

  inputContainer: {
    height: windowHeight * 0.16,
    backgroundColor: grey,
    alignItems: "center",
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 6,
    justifyContent: "space-evenly"
  },

  textInput: {
    width: "100%",
    height: 30,
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: dark,
    padding: 0
  },

  addButton: {
    width: "40%",
    alignItems: "center",
    backgroundColor: purple,
    paddingVertical: 4,
    alignSelf: "center",
    borderRadius: 8
  },

  buttonText: {
    color: "white"
  },

  scroll: {
    flex: 1
  },

  emptyInfoView: {
    paddingTop: 32,
    justifyContent: "center",
    alignItems: "center"
  },

  emptyInfoText: {
    color: white,
    fontSize: 26,
    fontWeight: "bold"
  },

  itemLine: (done) => ({
    backgroundColor: done ? white : green,
    marginHorizontal: 4,
    marginVertical: 6,
    padding: 8,
    borderRadius: 8
  }),

  lineText: (done) => ({
    color: done ? dark : white,
    fontWeight: "bold",
    textDecorationLine: done ? "line-through" : "none"
  })
})

export default App
