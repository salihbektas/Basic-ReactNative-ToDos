import React ,{useState, useCallback, useEffect} from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Dimensions,
  SafeAreaView,
  StatusBar
} from 'react-native';


import * as SplashScreen from 'expo-splash-screen';

import AsyncStorage from '@react-native-async-storage/async-storage';


SplashScreen.preventAutoHideAsync();

function App(){

  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");

  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {

        await AsyncStorage.getItem("@COUNT").then(data => {
          if(data !== null)
            setCount(JSON.parse(data));
        });

        await AsyncStorage.getItem("@TODOS").then(data => {
          if(data !== null)
            setItems(JSON.parse(data));
        });

      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);
  


  function handleDone(index){
    let newData = [...items];
    if(newData[index].done){
      AsyncStorage.setItem("@COUNT", JSON.stringify(count+1)).then(()=>{
        setCount(current => current + 1);
      }).catch(error=> console.warn(error));
    }
    else{
      AsyncStorage.setItem("@COUNT", JSON.stringify(count-1)).then(()=>{
        setCount(current => current - 1);
      }).catch(error=> console.warn(error));
    }
    
    newData[index].done = !newData[index].done;
    AsyncStorage.setItem("@TODOS", JSON.stringify(newData)).then(()=>{
      setItems(newData);
    }).catch(error=> console.warn(error));
  }

  function handleDelete(index){
    let newData = [];
    for(let i = 0; i < items.length; ++i){
      if(i !== index){
        newData.push(items[i]);
      }
    }
    if(!items[index].done){
      AsyncStorage.setItem("@COUNT", JSON.stringify(count-1)).then(()=>{
        setCount(current => current - 1);
      }).catch(error=> console.warn(error));
    }

    AsyncStorage.setItem("@TODOS", JSON.stringify(newData)).then(()=>{
      setItems(newData);
    }).catch(error=> console.warn(error));
  }

  function addItem(){
    if(text !== ""){
      let newData = [...items];
      newData.push({title: text, done: false});
      setText("");
      
      AsyncStorage.setItem("@COUNT", JSON.stringify(count+1)).then(()=>{
        setCount(current => current + 1);
      }).catch(error=> console.warn(error));

      AsyncStorage.setItem("@TODOS", JSON.stringify(newData)).then(()=>{
        setItems(newData);
      }).catch(error=> console.warn(error));
    }
  }
  
  return(
    <>
      <StatusBar barStyle={'light-content'}/>
      <SafeAreaView
        style={styles.safe}
        onLayout={onLayoutRootView}>

          <View style={styles.header}>
            <Text style={styles.headreText}>To-Do's</Text>
            <Text style={styles.headreText}>{count}</Text>
          </View>

          <View style={styles.inputContainer}>
              <TextInput style={styles.textInput} 
                placeholder="Do ..."
                onChangeText={input => setText(input)} 
                defaultValue={text}/>
              <Pressable style={styles.addButton} onPress={addItem}>
                  <Text style={styles.buttonText}>Add</Text>
              </Pressable>
          </View>

          <ScrollView style={styles.scroll}>
            {items.length === 0 ? 
              <View style={styles.emptyInfoView}>
              <Text style={styles.emptyInfoText}>Nothing To Do ...</Text>
              </View>
            :
            items.map((item, index) => {return(
              <Pressable onPress={() => handleDone(index)} onLongPress={() => handleDelete(index)} key={index}>
                  <View style={styles.itemLine(item.done)}>
                    <Text style={styles.lineText(item.done)}>{item.title}</Text>
                  </View>
                </Pressable>
            )})}    
          </ScrollView>

      </SafeAreaView>
    </>
  );
}

const dark = "#16161A";
const purple = "#7F5AF0";
const green = "#2CB67D";
const white = "#FFFFFE";
const grey = "#94A1B2";
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  safe: {
    flex:1,
    backgroundColor: dark,  
    padding: 8, 
    justifyContent:"center"
  },
  
  header: {
    height: windowHeight*0.08, 
    flexDirection:"row", 
    justifyContent:"space-between", 
    alignItems:"center"
  },

  headreText: {
    color: purple,
    fontSize: 28,
    fontWeight:"bold"
  },

  inputContainer: {
    height: windowHeight*0.16,
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
    flex:1
  },

  emptyInfoView: {
    paddingTop: 32,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyInfoText: {
    color: white,
    fontSize: 26,
    fontWeight: "bold",
  },

  itemLine : (done) => ({
    backgroundColor: done ? white : green,
    marginHorizontal: 4,
    marginVertical: 6,
    padding: 8,
    borderRadius: 8
  }),

  lineText : (done) => ({
    color: done ? dark : white,
    fontWeight: "bold",
    textDecorationLine: done ? "line-through" : "none"
  })


});

export default App;
