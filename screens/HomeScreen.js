import React from "react";
import {
  AsyncStorage,
  Button,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebBrowser } from "expo";
import moment from "moment";

import { MonoText } from "../components/StyledText";

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };
  state = {
    drinks: [],
  };

  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem("DRINKS");
      if (value !== null) {
        this.setState({ drinks: JSON.parse(value) });
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  _storeData = async () => {
    try {
      await AsyncStorage.setItem("DRINKS", JSON.stringify(this.state.drinks));
    } catch (error) {
      // Error saving data
    }
  };

  componentDidMount() {
    this._retrieveData();
    this.forceUpdate();
  }

  componentWillUnmount() {
    this._storeData();
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.welcomeContainer}>
            <Image
              source={
                __DEV__
                  ? require("../assets/images/robot-dev.png")
                  : require("../assets/images/robot-prod.png")
              }
              style={styles.welcomeImage}
            />
          </View>
          <View style={styles.getStartedContainer}>
            {this.state.drinks.map((drink, i) => {
              return (
                <View key={i} style={styles.drink}>
                  <Text style={styles.drinkText}>
                    {drink.name} {moment(drink.time).format("HH:mm")}
                  </Text>
                  <Button
                    title="X"
                    onPress={() => {
                      const drinks = this.state.drinks;
                      drinks.splice(i, 1);
                      this.setState({ drinks }, this._storeData);
                    }}
                  />
                </View>
              );
            })}
          </View>

          <Text style={styles.bacText}>BAC: {this.calculateBAC()}</Text>

          {/*<View style={styles.getStartedContainer}>
            {this._maybeRenderDevelopmentModeWarning()}

            <Text style={styles.getStartedText}>Get started by opening</Text>

            <View style={[styles.codeHighlightContainer, styles.homeScreenFilename]}>
              <MonoText style={styles.codeHighlightText}>screens/HomeScreen.js</MonoText>
            </View>

            <Text style={styles.getStartedText}>
              Change this text and your app will automatically reload.
            </Text>
          </View>

          <View style={styles.helpContainer}>
            <TouchableOpacity onPress={this._handleHelpPress} style={styles.helpLink}>
              <Text style={styles.helpLinkText}>Help, it didn’t automatically reload!</Text>
            </TouchableOpacity>
            </View>*/}
        </ScrollView>

        <View style={styles.tabBarInfoContainer}>
          <Button
            title="Add Drink"
            onPress={() => {
              const drink = { name: "drink", time: new Date().toJSON() };
              this.setState(
                { drinks: [...this.state.drinks, drink] },
                this._storeData,
              );
            }}
            style={{ position: "absolute", top: "-52px" }}
          />
        </View>
      </View>
    );
  }

  calculateBAC() {
    const { drinks } = this.state;
    // BAC = [Alcohol consumed in grams / (Body weight in grams x r)] x 100.
    // In this formula, “r” is the gender constant: r = 0.55 for females and 0.68 for males.
    // BAC as a percentage – (elapsed time in hours x 0. 015)
    // 14 g of alcohol in standard
    let bac = 0;
    const drinksByHour = {};
    drinks.forEach(drink => {
      const hour = moment().diff(drink.time, "hours");
      drinksByHour[hour]
        ? drinksByHour[hour].push(drink)
        : (drinksByHour[hour] = [drink]);
    });
    Object.keys(drinksByHour).forEach(hour => {
      const increase =
        ((14 * drinksByHour[hour].length) / (75000 * 0.68)) * 100 -
        hour * 0.015;
      // console.log(hour, drinksByHour[hour].length, increase);
      bac += Math.max(increase, 0);
    });
    return bac.toFixed(4);
  }

  _maybeRenderDevelopmentModeWarning() {
    if (__DEV__) {
      const learnMoreButton = (
        <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
          Learn more
        </Text>
      );

      return (
        <Text style={styles.developmentModeText}>
          Development mode is enabled, your app will be slower but you can use
          useful development tools. {learnMoreButton}
        </Text>
      );
    } else {
      return (
        <Text style={styles.developmentModeText}>
          You are not in development mode, your app will run at full speed.
        </Text>
      );
    }
  }

  _handleLearnMorePress = () => {
    WebBrowser.openBrowserAsync(
      "https://docs.expo.io/versions/latest/guides/development-mode",
    );
  };

  _handleHelpPress = () => {
    WebBrowser.openBrowserAsync(
      "https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes",
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  developmentModeText: {
    marginBottom: 20,
    color: "rgba(0,0,0,0.4)",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
  },
  contentContainer: {
    paddingTop: 30,
    paddingBottom: 100,
  },
  welcomeContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: "contain",
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    // alignItems: "center",
    marginHorizontal: 20,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: "rgba(96,100,109, 0.8)",
  },
  codeHighlightContainer: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    lineHeight: 24,
    textAlign: "center",
  },
  drink: {
    marginBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
    height: 48,
  },
  drinkText: {
    fontSize: 17,
  },
  bacText: {
    color: "rgb(255, 0, 0)",
    fontSize: 17,
    textAlign: "center",
  },
  tabBarInfoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: "center",
    backgroundColor: "#fbfbfb",
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    textAlign: "center",
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: "#2e78b7",
  },
});
