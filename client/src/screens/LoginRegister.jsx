import React, { useEffect, useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, TextInput, View, Image, ScrollView, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from "react-native";
import Checkbox from "expo-checkbox";
import banner from "../../assets/image/banner.jpg";
import googleIcon from "../../assets/vector/google.png";
import Modal from "react-native-modal";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { createOtp, handleLogin, registerHandler } from "../../store/actions";
import { errorAlert, successAlert } from "../helpers/alert";

function Login({ navigation }) {
  const [isChecked, setChecked] = useState(false);
  const [inputRegister, setInputRegister] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [inputLogin, setInputLogin] = useState({ email: "", password: "" });
  const [loginForm, setLoginForm] = useState(true);
  const [formRegister, setFormRegister] = useState(false);
  const [formOtp, setFormOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userOtp, setUserOtp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [succMsg, setSuccMsg] = useState("");
  const dispatch = useDispatch();

  const changePage = () => {
    setFormRegister(!formRegister);
    setLoginForm(!loginForm);
  };
  const handleOtpChange = (index, value) => {
    if (/^[0-9]$/.test(value) || value === "") {
      let updatedOtp = [...otp];
      updatedOtp[index] = value;
      setOtp(updatedOtp);

      if (index > 0 && value === "") {
        otpInputs[index - 1].focus();
      } else if (index < 3 && value !== "") {
        otpInputs[index + 1].focus();
      }
    }
  };

  useEffect(() => {
    setUserOtp(otp.join(""));
  }, [otp]);

  const getOtp = async () => {
    setLoading(true);
    dispatch(createOtp(inputLogin))
      .then((data) => {
        toggleOtp();
        setLoading(false);
        setSuccMsg(data.message);
      })
      .catch((err) => {
        errorAlert(err);
        setLoading(false);
      });
  };

  const handleChangeLogin = (name, text) => {
    setInputLogin((input) => ({
      ...input,
      [name]: text,
    }));
  };

  const handleChangeRegister = (name, text) => {
    setInputRegister((input) => ({
      ...input,
      [name]: text,
    }));
  };

  const submitRegister = () => {
    dispatch(registerHandler(inputRegister))
      .then((data) => {
        successAlert(data.message);
        changePage();
        setFormRegister(false),
          setInputRegister({
            fullName: "",
            email: "",
            password: "",
            phone: "",
          });
      })
      .catch((err) => errorAlert(err));
  };

  const storeData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const submitOtp = async () => {
    inputLogin.otp = userOtp;
    dispatch(handleLogin(inputLogin))
      .then((data) => {
        storeData("access_token", data.access_token).then(() => {
          navigation.navigate("Home");
          toggleOtp();
          successAlert("Welcome to RentNRoll");
        });
      })
      .catch((error) => {
        setErrMsg(error);
      });
  };
  const otpInputs = [];

  const toggleRememberMe = () => {
    setChecked(!isChecked);
  };

  const toggleOtp = () => {
    setFormOtp(!formOtp);
  };

  useEffect(() => {
    if (errMsg) {
      setSuccMsg("");
      setTimeout(() => {
        setErrMsg("");
      }, 3000);
    }
  }, [errMsg]);

  return (
    <View style={styles.container}>
      <ImageBackground source={banner} style={styles.backgroundImage} resizeMode="cover">
        <Text style={styles.textWithShadow}>{formRegister ? "Register" : "Log in"}</Text>
        <Pressable style={styles.buttonBack} onPress={() => navigation.navigate("Home")}>
          <Ionicons name="arrow-back-sharp" size={20} color="white" />
        </Pressable>
      </ImageBackground>

      {/* login */}
      {loginForm && (
        <View style={styles.formContainer}>
          <View style={{ gap: 5 }}>
            <Text style={styles.label}>Email</Text>
            <TextInput placeholder="email" keyboardType="email-address" value={inputLogin.email} returnKeyType={"done"} onChangeText={(text) => handleChangeLogin("email", text)} style={styles.textInput} />
          </View>
          <View style={{ gap: 5 }}>
            <Text style={styles.label}>Password</Text>
            <TextInput placeholder="password" secureTextEntry={true} returnKeyType={"done"} name="password" value={inputLogin.password} onChangeText={(text) => handleChangeLogin("password", text)} style={styles.textInput} />
          </View>
          <View style={styles.checkboxContainer}>
            <View style={styles.checkBoxView}>
              <Checkbox style={styles.checkbox} value={isChecked} onValueChange={toggleRememberMe} color={isChecked ? "#17799A" : undefined} />
              <Text style={{ paddingLeft: -50 }}>Remember Me</Text>
            </View>
          </View>
          {loading && (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" />
              <Text style={{ marginTop: 16, fontSize: 18 }}>Loading...</Text>
            </View>
          )}

          <View style={{ marginTop: 15 }}>
            <View style={styles.actionContainer}>
              <Text style={{ textAlign: "center" }}>Dont have account? </Text>
              <Pressable onPress={changePage}>
                <Text style={{ textDecorationLine: "underline", color: "#17799A" }}>Register Now</Text>
              </Pressable>
            </View>
            <Pressable style={styles.buttonAction} onPress={getOtp}>
              <Text style={styles.textAction}>Log In</Text>
            </Pressable>
          </View>
        </View>
      )}
      {/* end login */}

      {/* register */}
      {formRegister && (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.registerContainer}>
          <ScrollView>
            <View style={[styles.formContainer, { justifyContent: "space-around" }]}>
              <View style={{ gap: 10 }}>
                <View style={{ gap: 5 }}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput placeholder="username" style={styles.textInput} value={inputRegister.fullName} returnKeyType={"done"} onChangeText={(text) => handleChangeRegister("fullName", text)} />
                </View>
                <View style={{ gap: 5 }}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput placeholder="email" style={styles.textInput} value={inputRegister.email} returnKeyType={"done"} onChangeText={(text) => handleChangeRegister("email", text)} />
                </View>
                <View style={{ gap: 5 }}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput placeholder="password" secureTextEntry={true} style={styles.textInput} returnKeyType={"done"} value={inputRegister.password} onChangeText={(text) => handleChangeRegister("password", text)} />
                </View>

                <View style={{ gap: 5 }}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <TextInput placeholder="081233623XXX" keyboardType="numeric" style={styles.textInput} returnKeyType="done" value={inputRegister.phone} onChangeText={(text) => handleChangeRegister("phone", text)} />
                  </TouchableWithoutFeedback>
                </View>
              </View>

              <View
                style={{
                  marginTop: 15,
                }}
              >
                <View style={styles.actionContainer}>
                  <Text
                    style={{
                      textAlign: "center",
                    }}
                  >
                    Already have account?
                  </Text>
                  <Pressable onPress={changePage}>
                    <Text
                      style={{
                        textDecorationLine: "underline",
                        color: "#17799A",
                      }}
                    >
                      Log in
                    </Text>
                  </Pressable>
                </View>
                <Pressable style={styles.buttonAction} onPress={submitRegister}>
                  <Text style={styles.textAction}>Register</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* end register */}

      {/* modalotp */}
      <Modal
        isVisible={formOtp}
        onBackdropPress={toggleOtp}
        style={{
          justifyContent: "center",
          margin: 0,
        }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.otpContainer}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.otpField}>
              <Text style={styles.otpText}>Enter the OTP you received via email</Text>
              {errMsg && <Text style={{ color: "red", fontSize: 13, marginTop: -10 }}>{errMsg}</Text>}
              {succMsg && <Text style={{ color: "green", fontSize: 13, marginTop: -10 }}>{succMsg}</Text>}
              <View style={styles.otpView}>
                {otp.map((digit, index) => (
                  <TextInput key={index} style={styles.otpInput} value={digit} onChangeText={(value) => handleOtpChange(index, value)} keyboardType="numeric" maxLength={1} ref={(ref) => (otpInputs[index] = ref)} returnKeyType="done" />
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
          <Pressable style={[styles.buttonAction, { paddingHorizontal: 90 }]} onPress={submitOtp}>
            <Text style={styles.textAction}>Submit</Text>
          </Pressable>
          <Pressable style={{ position: "absolute", top: 20, right: 20 }} onPress={toggleOtp}>
            <MaterialIcons name="cancel" size={30} color="red" />
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
      {/* end modal otp */}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "#17799A",
  },

  textInput: {
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 15,
    borderWidth: 0.5,
    borderColor: "black",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  backgroundImage: {
    height: 250,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 20,
    position: "relative",
  },

  textWithShadow: {
    fontSize: 24,
    color: "white",
    textShadowColor: "black",
    textShadowOffset: {
      width: 2,
      height: 2,
    },
    textShadowRadius: 5,
  },

  lineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "gray",
  },

  orText: {
    color: "#777",
    fontSize: 16,
    marginHorizontal: 10,
  },

  buttonBack: {
    position: "absolute",
    top: 40,
    margin: 20,
    zIndex: 0,
    flex: 1,
    alignSelf: "flex-start",
    backgroundColor: "#17799A",
    height: 30,
    width: 30,
    borderRadius: "50%",
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  formContainer: {
    gap: 15,
    flex: 1,
    backgroundColor: "white",
    borderTopEndRadius: 15,
    borderTopStartRadius: 15,
    padding: 20,
    paddingVertical: 30,
  },

  registerContainer: {
    backgroundColor: "white",
    flex: 1,
    padding: 20,
    paddingVertical: 30,
    borderTopEndRadius: 15,
    borderTopStartRadius: 15,
  },

  checkboxContainer: {
    flexDirection: "row",
    paddingHorizontal: 5,
    marginTop: 10,
  },

  checkBoxView: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  label: {
    color: "black",
    fontSize: 18,
    marginStart: 5,
  },

  actionContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 8,
  },

  buttonAction: {
    padding: 10,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#17799A",
  },

  buttonGoggle: {
    padding: 10,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "whitesmoke",
    flexDirection: "row",
    gap: 5,
  },

  googleIcon: {
    width: 20,
    height: 20,
  },

  googleText: {
    color: "#17799A",
    fontWeight: "bold",
  },
  textAction: {
    color: "white",
    fontWeight: "bold",
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 20,
  },

  otpContainer: {
    position: "relative",
    backgroundColor: "whitesmoke",
    height: "30%",
    width: "95%",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: 10,
  },

  otpField: {
    gap: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  otpText: {
    fontSize: 15,
    fontWeight: "700",
  },

  otpView: {
    flexDirection: "row",
    marginBottom: 10,
    gap: 10,
  },
});
export default Login;
