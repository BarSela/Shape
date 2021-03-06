const bcrypt = require("bcrypt"); //Password encryption
const Trainee = require("../model/trainee");
const Trainer = require("../model/trainer");
const User = require("../model/user");

var userEmail = "";
var userType = "";

module.exports = {
  signup: async (req, res, next) => {
    let status = "false";
    let userType = req.body.userType;
    let fullName = req.body.fullName;
    let businessName = req.body.businessName;
    let email = req.body.email;
    let password = req.body.password;
    let gender = req.body.gender;
    let passwordRepeat = req.body.passwordRepeat;

    function onlyLetters(str) {
      return /^[a-zA-Z]+$/.test(str);
    }

    if (!onlyLetters(fullName)) {
      return res.render("pages/signUp", {
        status: status,
        userEmail: userEmail,
      });
    }
    if (password.length < 8) {
      return res.render("pages/signUp", {
        status: status,
        userEmail: userEmail,
      });
    }
    if (password != passwordRepeat) {
      return res.render("pages/signUp", {
        status: status,
        userEmail: userEmail,
      });
    }

    //trainee user
    if (userType == "trainee") {
      //checks if the email already exists in the databases
      Trainee.find({ email }).then((trainees) => {
        if (trainees.length >= 1) {
          return res.render("pages/signUp", {
            status: status,
            userEmail: userEmail,
          });
        }

        //Password encryption
        bcrypt.hash(password, 10, (error, hash) => {
          if (error) {
            return res.status(500).json({
              error,
            });
          }
          const user = new User({ fullName, email, password: hash, userType });
          user
            .save()
            .then((result) => {
              console.log("new user created");
            })
            .catch((error) => {
              res.status(500).json({
                error,
              });
              console.log("post error ");
            });
          const trainee = new Trainee({
            fullName,
            email,
            password: hash,
            gender,
          });
          trainee
            .save()
            .then((result) => {
              userEmail = trainee.email;
              userType = trainee.userType;
              console.log("new trainee created");
              return res.redirect("/traineeDashboard/" + trainee.email);
            })
            .catch((error) => {
              res.status(500).json({
                error,
              });
              console.log("post error ");
            });
        });
      });
    }

    //trainer user
    else if (userType == "trainer") {
      //checks if the email already exists in the databases
      Trainer.find({ email }).then((trainers) => {
        if (trainers.length >= 1) {
          return res.render("pages/signUp", {
            status: status,
            userEmail: userEmail,
          });
        }

        //Password encryption
        bcrypt.hash(password, 10, (error, hash) => {
          if (error) {
            return res.status(500).json({
              error,
            });
          }
          const user = new User({ fullName, email, password: hash, userType });
          user
            .save()
            .then((result) => {
              console.log("new user created");
            })
            .catch((error) => {
              res.status(500).json({
                error,
              });
              console.log("post error ");
            });

          const trainer = new Trainer({
            fullName,
            businessName,
            email,
            password: hash,
            gender,
          });
          trainer
            .save()
            .then((result) => {
              console.log("new trainer created");
              //monthStatistics:
              let statList = [];
              let monthStatistic = {
                scheduled: 0,
                canceled: 0,
                preformed: 0,
              };

              for (let i = 0; i < 12; i++) {
                statList.push(monthStatistic);
              }

              Trainer.updateOne(
                { _id: trainer._id },
                { monthStatistics: statList }
              )
                .then(() => {
                  return true;
                })
                .catch((error) => {
                  return false;
                });

              userEmail = trainer.email;
              userType = trainer.userType;
              return res.redirect("/createBusinessProfile/" + trainer.email);
            })
            .catch((error) => {
              res.status(500).json({
                error,
              });
              console.log("post error ");
            });
        });
      });
    }
  },

  login: async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    userEmail = "";
    var loginStatus = "false";
    console.log("email1 : " + email);
    User.find({ email: email }).then((users) => {
      //If the user list is empty
      if (users.length === 0) {
        return res.render("pages/login", {
          loginStatus: loginStatus,
          userEmail: userEmail,
        });
      }

      const [user] = users;
      //Checking the password
      bcrypt.compare(password, user.password, (error, result) => {
        if (error) {
          return res.render("pages/login", {
            loginStatus: loginStatus,
            userEmail: userEmail,
          });
        }
        if (result) {
          if (user.userType == "trainer") {
            userEmail = user.email;
            userType = "trainer";
            console.log("trainer");
            console.log("Auth successful");
            return res.redirect("/trainerDashboard/" + user.email);
          } else if (user.userType == "trainee") {
            userEmail = user.email;
            userType = "trainee";

            //update 'pass' field for all trainings:
            var today = new Date();
            Trainee.findOne({ email: userEmail }).then((trainee) => {
              if (!trainee) {
                return false;
              } else {
                if (trainee.trainings) {
                  trainings = trainee.trainings;
                  for (var i = 0; i < trainings.length; i++) {
                    if (trainings[i].trainingDate < today) {
                      trainings[i].pass = true;
                      console.log("found passed trainings");
                    }
                  }
                  Trainee.updateOne(
                    { _id: trainee._id },
                    { trainings: trainings }
                  );
                }
              }
            });

            console.log("trainee");
            console.log("Auth successful");
            return res.redirect("/traineeDashboard/" + user.email);
          }
        }
        //If the password is incorrect
        return res.render("pages/login", {
          loginStatus: loginStatus,
          userEmail: userEmail,
        });
      }); //end bcrypt
    }); //end User.find
  },
  createBusinessP: async (req, res) => {
    let specialty = req.body.specialty;
    let city = req.body.city;
    let phone = req.body.phone;
    let about = req.body.about;
    let schoolName = req.body.schoolName;
    let schoolDate = req.body.date;
    let schoolInfo = req.body.info;

    let hebrew = req.body.hebrew;
    let english = req.body.english;
    let spanish = req.body.spanish;
    let russian = req.body.russian;
    let arabic = req.body.arabic;

    // let typeName1 = req.body.typeName1;
    // let typeName2 = req.body.typeName2;
    // let typeName3 = req.body.typeName3;
    // let typeName4 = req.body.typeName4;

    // let typeDuration1 = parseInt(req.body.typeDuration1);
    // let typeDuration2 = parseInt(req.body.typeDuration2);
    // let typeDuration3 = parseInt(req.body.typeDuration3);
    // let typeDuration4 = parseInt(req.body.typeDuration4);

    // let typePrice1 = parseInt(req.body.typePrice1);
    // let typePrice2 = parseInt(req.body.typePrice2);
    // let typePrice3 = parseInt(req.body.typePrice3);
    // let typePrice4 = parseInt(req.body.typePrice4);

    // let typeId1 = "";
    // let typeId2 = "";
    // let typeId3 = "";
    // let typeId4 = "";
    // let trainingType1;
    // let trainingType2;
    // let trainingType3;
    // let trainingType4;
    // let trainer;
    //  trainingType1 ={
    //   name: typeName1.toString(),
    //   duration: typeDuration1,
    //   price: typePrice1,
    // }

    // console.log("trainingtype:" + trainingType1);

    // if (typeName2) {
    //     trainingType2 ={
    //     name: typeName2.toString(),
    //     duration: typeDuration2,
    //     price: typePrice2,
    //   }

    // }
    // else{
    //   trainingType2 ={
    //     name:"empty"
    //   }
    // }
    // console.log("trainingtype:" + trainingType2);

    // if (typeName3) {
    //   trainingType3 ={
    //     name: typeName3.toString(),
    //     duration: typeDuration3,
    //     price: typePrice3,
    //   }

    // }
    // else{
    //   trainingType3 ={
    //     name:"empty"
    //   }
    // }
    // if (typeName4) {
    //   trainingType4 ={
    //     name: typeName4.toString(),
    //     duration: typeDuration4,
    //     price: typePrice4,
    //   }
    // }
    // else{
    //   trainingType4 ={
    //     name:"empty"
    //   }
    // }
    // console.log(trainingType4);
    // console.log(typeId1);
    // console.log(typeId2);
    // console.log(typeId3);
    // console.log(typeId4);

    trainer = await Trainer.findOneAndUpdate(
      { email: userEmail },
      {
        $set: {
          specialty: specialty,
          city: city,
          phone: phone,
          about: about,
          schoolName: schoolName,
          schoolDate: schoolDate,
          schoolInfo: schoolInfo,
          hebrew: hebrew,
          english: english,
          spanish: spanish,
          russian: russian,
          arabic: arabic,
          // trainingTypes:[trainingType1,trainingType2,trainingType3,trainingType4]
        },
      }
    );

    if (trainer) {
      console.log(trainer);
      console.log("1");

      return res.redirect("/createTrainingTypes");
    } else {
      res.redirect("/");
    }
  },
  editBusinessP: async (req, res, next) => {
    let businassName = req.body.BusinessName;
    let fullName = req.body.fullName;
    let specialty = req.body.specialty;
    let city = req.body.city;
    let phone = req.body.phone;
    let about = req.body.about;
    let schoolName = req.body.schoolName;
    let schoolDate = req.body.date;
    let schoolInfo = req.body.info;

    let hebrew = req.body.Hebrew;
    let english = req.body.english;
    let russian = req.body.russian;
    let spanish = req.body.spanish;
    let arabic = req.body.arabic;

    const trainer = await Trainer.findOneAndUpdate(
      { email: userEmail },
      {
        $set: {
          businassName: businassName,
          fullName: fullName,
          specialty: specialty,
          city: city,
          phone: phone,
          about: about,
          schoolName: schoolName,
          schoolDate: schoolDate,
          schoolInfo: schoolInfo,
          hebrew: hebrew,
          english: english,
          spanish: spanish,
          russian: russian,
          arabic: arabic,
        },
      }
    );
    if (trainer) {
      res.redirect("/businessProfile");
    } else {
      console("Error to find trainer");
      res.render("/");
    }
  },
  editPersonalprofile: async (req, res) => {
    var fullName = req.body.fullName;
    var newEmail = req.body.email;
    var gender = req.body.gender;
    var status = "false";
    const currUser = await User.findOne({ email: userEmail });
    let type = currUser.userType;
    //check if the new email already exsits in the DB
    let user = await User.findOne({ email: newEmail });
    console.log(user);
    if (user != null && newEmail != userEmail) {
      console.log("if user");
      console.log(userEmail);
      console.log(currUser);
      return res.render("pages/editPersonalProfile", {
        userEmail: userEmail,
        user: currUser,
        status: status,
        userType: type,
      });
    }
    let userT = currUser.userType;
    //else
    user = await User.findOneAndUpdate(
      { email: userEmail },
      {
        $set: {
          fullName: fullName,
          email: newEmail,
        },
      }
    );

    if (user) {
      console.log("Email updated successfully");

      console.log(userT);
    } else {
      console.log("Failed to update email (profile Page -user)");
      res.redirect("/");
    }
    if (userT == "trainer") {
      const trainer = await Trainer.findOneAndUpdate(
        { email: userEmail },
        {
          $set: {
            fullName: fullName,
            email: newEmail,
            gender: gender,
          },
        }
      );
      if (trainer) {
        userEmail = newEmail;
        return res.redirect("personalProfile/" + newEmail);
      } else {
        console.log("Failed to update email (profile Page - trainer)");
        res.redirect("/");
      }
    } else if (userT == "trainee") {
      console.log(newEmail);
      const trainee = await Trainee.findOneAndUpdate(
        { email: userEmail },
        {
          $set: {
            fullName: fullName,
            email: newEmail,
            gender: gender,
          },
        }
      );
      console.log(trainee);
      if (trainee) {
        console.log(newEmail);
        userEmail = newEmail;
        return res.redirect("personalProfile/" + newEmail);
      } else {
        console.log("Failed to update email (profile Page - trainee)");
        res.redirect("/");
      }
    }
  },
  editPassword: async (req, res) => {
    console.log("editpassword");

    //param
    let type;
    let currPassword = req.body.currPassword;
    let newPassword = req.body.newPassword;

    //login status
    let status = "false";

    //--find user--
    User.find({ email: userEmail }).then((users) => {
      //If the user list is empty
      if (users.length === 0) {
        return res.render("pages/editPersonalProfile", {
          status: status,
          user: userEmail,
        });
      }
      const [user] = users;
      type = user.userType;
      //Checking the password
      bcrypt.compare(currPassword, user.password, async (error, result) => {
        if (error) {
          //wrong password
          return res.render("pages/editPersonalProfile", {
            loginStatus: loginStatus,
            user: userEmail,
            userType: type,
          });
        }
        if (result) {
          //good password
          console.log("good password");

          if (user.userType == "trainer") {
            //--if trainer
            bcrypt.hash(newPassword, 10, async (error, hash) => {
              if (error) {
                //bad bcrypt
                return res.status(500).json({
                  error,
                });
              }
              const userU = await User.findOneAndUpdate(
                { email: userEmail },
                {
                  $set: {
                    password: hash,
                  },
                }
              );
              if (userU) {
                //success
                const trainer = await Trainer.findOneAndUpdate(
                  { email: userEmail },
                  {
                    $set: {
                      password: hash,
                    },
                  }
                );
                if (trainer) {
                  return res.redirect("/personalProfile");
                } else {
                  console.log("Error to find trainer");
                  return res.render("/");
                }
              } //error! traainer not found
              else {
                console.log("Error to find user");
                return res.render("/");
              }
            });
          } else if (user.userType == "trainee") {
            console.log("trainee--------------");
            //----if trainee
            bcrypt.hash(newPassword, 10, async (error, hash) => {
              if (error) {
                //bad bcrypt
                return res.status(500).json({
                  error,
                });
              }
              const userU = await User.findOneAndUpdate(
                { email: userEmail },
                {
                  $set: {
                    password: hash,
                  },
                }
              );
              console.log("update1");
              if (userU) {
                console.log("userU ok");
                const trainee = await Trainee.findOneAndUpdate(
                  { email: userEmail },
                  {
                    $set: {
                      password: hash,
                    },
                  }
                );
                if (trainee) {
                  console.log("trainee redirect");
                  return res.redirect("/personalProfile");
                } else {
                  console.log("Error to find trainee");
                  res.render("/");
                }
              } else {
                console.log("Error to find user");
                res.render("/");
              }
            });
          }
        } else {
          //If the password is incorrect

          console.log("bad password");

          return res.render("pages/editPersonalProfile", {
            status: status,
            user: userEmail,
            userEmail: userEmail,
            userType: type,
          });
        }
      }); //end bcrypt
    }); //end User.find

    console.log("okkkkkkkkkkkk");
  },
  deleteAccount: async (req, res) => {
    const currUser = await User.findOne({ email: userEmail });
    let userType = currUser.userType;
    console.log(userType);
    if (userType == "trainer") {
      const user = await Trainer.findOneAndDelete({ email: userEmail });
    }
    if (userType == "trainee") {
      const user = await Trainee.findOneAndDelete({ email: userEmail });
    }
    const user = await User.findOneAndDelete({ email: userEmail });

    if (user) {
      userEmail = "";
      return res.redirect("/logout");
    } else {
      console("Error to find user-fail delete account");
      res.render("/");
    }
  },

  editTrainingTypes: async (req, res) => {
    let typeName = req.body.trainingTypeName;
    let newTypeName = req.body.newTrainingTypeName;
    let typeDuration = parseInt(req.body.trainingTypeDuration);
    let typePrice = parseInt(req.body.trainingTypePrice);
    let page = req.body.page;

    console.log("type price");
    console.log(req.body.trainingTypePrice);

    console.log("type name");
    console.log(typeName);
    console.log(page);

    let types;
    Trainer.findOne({ email: userEmail }).then((trainer) => {
      if (!trainer) {
        return false;
      } else {
        if (trainer.trainingTypes != null) {
          types = trainer.trainingTypes;
          for (let i = 0; i < types.length; i++) {
            if (types[i].name == typeName) {
              types[i].name = newTypeName;
              types[i].price = typePrice;
              types[i].duration = typeDuration;
            }
          }
        }
      }
      Trainer.updateOne({ _id: trainer._id }, { trainingTypes: types })
        .then(() => {
          if (page == "edit") {
            return res.redirect("/editTrainingTypes");
          } else {
            return res.redirect("/createTrainingTypes");
          }
        })
        .catch((error) => {
          return res.redirect("/businessProfile");
        });
    });
  },
  deleteTrainingTypes: async (req, res) => {
    let typeName = req.body.trainingTypeName;
    let typeDuration = parseInt(req.body.trainingTypeDuration);
    let typePrice = parseInt(req.body.trainingTypePrice);
    let page = req.body.page;

    console.log("type name");
    console.log(typeName);

    let types;
    Trainer.findOne({ email: userEmail }).then((trainer) => {
      if (!trainer) {
        return false;
      } else {
        if (trainer.trainingTypes != null) {
          types = trainer.trainingTypes;
          for (let i = 0; i < types.length; i++) {
            if (types[i].name == typeName) {
              types.splice(i, 1);
            }
          }
        }
      }
      Trainer.updateOne({ _id: trainer._id }, { trainingTypes: types })
        .then(() => {
          console.log("true");
          if (page == "edit") {
            return res.redirect("/editTrainingTypes");
          } else {
            return res.redirect("/createTrainingTypes");
          }
        })
        .catch((error) => {
          console.log("false");
          return res.redirect("/businessProfile");
        });
    });
  },
  getAllTrainers: () => {
    Trainer.find()
      .then((trainers) => {
        return trainers;
      })
      .catch((error) => {
        return null;
      });
  },
  getAllTrainings: (userEmail) => {
    Trainer.findOne({ email: userEmail })
      .then((trainer) => {
        return trainer.trainings;
      })
      .catch((error) => {
        return null;
      });
  },
  getAllTrainingTypes: (userEmail) => {
    Trainer.findOne({ email: userEmail })
      .then((trainer) => {
        return trainer.trainingTypes;
      })
      .catch((error) => {
        return null;
      });
  },
  addTraining: async (userEmail, training) => {
    let trainings = [];
    Trainer.findOne({ email: userEmail }).then((trainer) => {
      if (!trainer) {
        return false;
      } else {
        if (trainer.trainings) {
          trainings = trainer.trainings;
          trainings.push(training);
          console.log("new training: " + training);

          console.log("trainings list: " + trainings);
        }
      }
      Trainer.updateOne({ _id: trainer._id }, { trainings: trainings })
        .then(() => {
          return true;
        })
        .catch((error) => {
          return false;
        });
    });
  },
  addTrainingType: async (req, res) => {
    let newTrainingTypeName = req.body.trainingTypeName;
    let newTrainingTypeDuration = req.body.trainingTypeDuration;
    let newTrainingTypePrice = req.body.trainingTypePrice;
    let page = req.body.page;
    let types;

    let trainingType = {
      name: newTrainingTypeName.toString(),
      duration: newTrainingTypeDuration,
      price: newTrainingTypePrice,
    };

    Trainer.findOne({ email: userEmail }).then((trainer) => {
      if (!trainer) {
        return false;
      } else {
        if (trainer.trainingTypes != null) {
          types = trainer.trainingTypes;
          types.push(trainingType);
        }
      }
      Trainer.updateOne({ _id: trainer._id }, { trainingTypes: types })
        .then(() => {
          if (page == "edit") {
            return res.redirect("/editTrainingTypes");
          } else {
            return res.redirect("/createTrainingTypes");
          }
        })
        .catch((error) => {
          console.log(error);
          return res.redirect("/businessProfile");
        });
    });
  },

  editTraining: async (trainerEmail, newTraining, id) => {
    var trainingDate;
    var startTime;
    var traineeEmail;

    Trainer.findOne({ email: trainerEmail }).then((trainer) => {
      if (!trainer) {
        return false;
      } else {
        if (trainer.trainings != null) {
          trainings = trainer.trainings;
          for (let i = 0; i < trainings.length; i++) {
            if (trainings[i]._id.toString() == id) {
              // trainings.splice(i);
              traineeEmail = trainings[i].traineeEmail;
              trainingDate = trainings[i].trainingDate;
              startTime = trainings[i].startHour;
              trainings[i] = newTraining;
            }
          }
        }
      }
      console.log(traineeEmail);
      Trainer.updateOne({ _id: trainer._id }, { trainings: trainings }).then(
        (trainer) => {
          if (!trainer) {
            //return false;
          } else {
            //return true;
          }
        }
      );
    });
    console.log(
      "good1000000000000000000000000000000000000000000000000000000000000000000000000"
    );
    console.log(traineeEmail);
    Trainee.findOne({ email: traineeEmail }).then((trainee) => {
      if (!trainee) {
        return false;
      } else {
        console.log(
          "good2222222000000000000000000000000000000000000000000000000000000000000000000000"
        );

        let trainingsTrainee = trainee.trainings;
        for (var i = 0; i < trainingsTrainee.length; i++) {
          let newDate;
                if(!trainingsTrainee[i].trainingDate.includes("-"))
                {
                  newDate = correctDate(trainingsTrainee[i].trainingDate);
                }
                else
                {
                  newDate =trainingsTrainee[i].trainingDate;
                }
          if (
            newDate == trainingDate &&
            trainingsTrainee[i].startHour == startTime
          ) {
            console.log(
              "yesssssss00000000000000000000000000000000000000000000000000000000000000000000"
            );

            trainingsTrainee[i] = newTraining;
          }
        }

        Trainee.updateOne(
          { email: traineeEmail },
          { trainings: trainingsTrainee }
        )
          .then(() => {
            console.log("true");
            return true;
          })
          .catch((error) => {
            console.log("true");

            return false;
          });
      }
    });
  },
  deleteTraining: async (trainerObj, trainingID) => {
    let trainingsList = trainerObj.trainings;
    for (let i = 0; i < trainingsList.length; i++) {
      if (trainingsList[i]._id.toString() == trainingID) {
        console.log("found");
        trainingsList.splice(i, 1);
      }
    }
    Trainer.updateOne(
      { email: trainerObj.email },
      { trainings: trainingsList }
    ).then((trainer) => {
      if (!trainer) {
        return false;
      } else {
        return true;
      }
    });
  },
  markUnavailable: (trainerObj, req) => {
    let date = req.body.markDate;
    let option = req.body.markOptions;
    console.log("option " + option);
    let start;
    let end;
    let old = [];
    if (option == "hour") {
      start = req.body.startHour;
      end = req.body.endHour;
      mark = { date: date, startHour: start, endHour: end, allDay: false };
    } else {
      //all day
      mark = { date: date, allDay: true };
    }

    if (trainerObj instanceof Trainer) {
      old = trainerObj.unAvailable;
      old.push(mark);
      Trainer.updateOne({ email: trainerObj.email }, { unAvailable: old }).then(
        (trainer) => {
          if (!trainer) {
            return false;
          } else {
            return true;
          }
        }
      );
    }
    return false;
  },
  deleteUnavailable: async (trainerObj, req) => {
    let id = req.body.uID;
    console.log("id: " + id);
    console.log("trainerObj: " + trainerObj.email);
    unAvailableList = trainerObj.unAvailable;
    for (let i = 0; i < unAvailableList.length; i++) {
      if (unAvailableList[i]._id.toString() == id) {
        console.log("found");
        unAvailableList.splice(i);
      }
    }
    Trainer.updateOne(
      { email: trainerObj.email },
      { unAvailable: unAvailableList }
    ).then((trainer) => {
      if (!trainer) {
        return false;
      } else {
        return true;
      }
    });
  },

  cancelTrainingRegistration: async (req, res) => {
    let trainingIDToDelete = req.body.trainingID;
    let trainingDateToDelete = req.body.trainingDate;
    let trainingHourToDelete = req.body.trainingHour;
    let trainingTypeToDelete = req.body.trainingType;
    let trainings;
    let trainingsT;
    let trainerEmail;

    console.log("1");

    Trainee.findOne({ email: userEmail }).then((trainee) => {
      if (!trainee) {
        console.log("2");
        return false;
      } else {
        console.log("3");
        if (trainee.trainings) {
          console.log("4");
          trainings = trainee.trainings;
          for (var i = 0; i < trainings.length; i++) {
          
            if (trainings[i]._id.toString() == trainingIDToDelete ) {
              trainerEmail = trainings[i].trainerEmail;
              console.log("5");
              trainings.splice(i, 1);
              console.log("found");
              console.log(trainerEmail);
              Trainer.findOne({ email: trainerEmail }).then((trainer) => {
                if (!trainer) {
                  return false;
                } else {
                  if (trainer.trainings) {
                    console.log("6");
                    trainingsT = trainer.trainings;
                    let notifications = trainer.notifications;
                    for (var i = 0; i < trainingsT.length; i++) {
                      if (trainingsT[i]._id.toString() == trainingIDToDelete ){
                        trainingsT[i].available = true;
                        trainingsT[i].traineeEmail = "";
                        console.log("found");
                      }
                    }
                    let notifi = {
                      read: false,
                      trainingType: trainingTypeToDelete,
                      trainingDate: trainingDateToDelete,
                      startHour: trainingHourToDelete,
                    };
                    console.log("trainerEmail");

                    console.log("notifi....................................");
                    console.log(notifi);
                    console.log("notifi....................................");
                    notifications.push(notifi);
                    Trainer.updateOne(
                      { email: trainerEmail },
                      { trainings: trainingsT, notifications: notifications }
                    )
                      .then(() => {
                        console.log("true");
                        return true;
                      })
                      .catch((error) => {
                        console.log("true");

                        return false;
                      });
                  }
                }
              });
            }
          }
        }
      }
      Trainee.updateOne({ _id: trainee._id }, { trainings: trainings })
        .then(() => {
          console.log("6");
          return res.redirect("/traineeDashboard/" + userEmail);
        })
        .catch((error) => {
          return res.redirect("/");
        });
    });
  },
  forgotPasseord: async (req, res) => {
    var nodemailer = require("nodemailer");
    email = req.body.email;
    var loginStatus = "false";
    console.log("email1 : " + email);
    User.find({ email: email }).then((users) => {
      //If the user list is empty
      if (users.length === 0) {
        return res.render("pages/forgotPassword", {
          loginStatus: loginStatus,
          userEmail: userEmail,
        });
      }
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      var link = "http://localhost:5000/resetPassword";
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "ShapeComp@gmail.com",
          pass: "Noa123456",
        },
      });
      const mailOptions = {
        from: "ShapeComp@gmail.com",
        to: email,
        subject: "Reset Password mail",
        text: "Hi , Please reset your password by clicking the link: ",
        html:
          `<a href='` +
          link +
          `'>Click On this link to Reset your password now!</a>
                  <p>Shape Tech Team</p>`,
      };
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) console.log(err);
        else console.log(info);
      });
    });
  },
  resetPassword: async (req, res, next) => {
    let password = req.body.password;
    let passwordRepeat = req.body.passwordRepeat;
    let status = "true";
    let email = req.body.userEmail;
    let loginStatus = "false";
    userEmail = "";
    console.log("emaaaaaaaail :" + email);

    if (password != passwordRepeat) {
      status = "false";
      return res.render("pages/resetPassword", {
        loginStatus: loginStatus,
        status: status,
        userEmail: userEmail,
      });
    }
    User.find({ email: email }).then((users) => {
      //If the user list is empty
      if (users.length === 0) {
        console.log("emaaaaaaaail :" + email + " does not exist");
        console.log("loginStatus:" + loginStatus);
        status = "false";
        return res.render("pages/resetPassword", {
          loginStatus: loginStatus,
          userEmail: userEmail,
          status: status,
        });
      }
      const [user] = users;
      //Checking the password
      userEmail = user.email;
      console.log("emaaaaaaaail :" + email);
      bcrypt.hash(password, 10, async (error, result) => {
        if (error) {
          return res.render("pages/resetPassword", {
            loginStatus: loginStatus,
            userEmail: userEmail,
          });
        }
        if (result) {
          if (user.userType == "trainer") {
            userEmail = user.email;
            bcrypt.hash(password, 10, async (error, hash) => {
              if (error) {
                //bad bcrypt
                return res.status(500).json({
                  error,
                });
              }
              const userU = await User.findOneAndUpdate(
                { email: userEmail },
                {
                  $set: {
                    password: hash,
                  },
                }
              );
              if (userU) {
                //success
                const trainer = await Trainer.findOneAndUpdate(
                  { email: userEmail },
                  {
                    $set: {
                      password: hash,
                    },
                  }
                );
                if (trainer) {
                  return res.redirect("/login");
                } else {
                  console.log("Error to find trainer");
                  return res.render("/");
                }
              } //error! traainer not found
              else {
                console.log("Error to find user");
                return res.render("/");
              }
            });
          } else if (user.userType == "trainee") {
            bcrypt.hash(password, 10, async (error, hash) => {
              if (error) {
                //bad bcrypt
                return res.status(500).json({
                  error,
                });
              }
              const userU = await User.findOneAndUpdate(
                { email: userEmail },
                {
                  $set: {
                    password: hash,
                  },
                }
              );
              console.log("update1");
              if (userU) {
                console.log("userU ok");
                const trainee = await Trainee.findOneAndUpdate(
                  { email: userEmail },
                  {
                    $set: {
                      password: hash,
                    },
                  }
                );
                if (trainee) {
                  console.log("trainee redirect");
                  return res.redirect("/login");
                } else {
                  console.log("Error to find trainee");
                  res.render("/");
                }
              } else {
                console.log("Error to find user");
                res.render("/");
              }
            });
          }
        }
      }); //end bcrypt
    }); //end User.find
    console.log("okkkkkkkkkkkk");
  },
  statistics: async (req, res) => {
    let month = req.body.month;
    return res.redirect("/statistics/" + month);
  },
};
function correctDate(date) {
  let dateList = date.split(" ");
  console.log(dateList);
  console.log(dateList[3]);
  console.log(dateList[1]);
  console.log(dateList[2]);

  let new_date = "";
  new_date += dateList[3];
  console.log(new_date);
  new_date += "-";
  let month;
  switch (dateList[1]) {
    case "Jan":
      month = "01";
      break;
    case "Feb":
      month = "02";
      break;
    case "Mar":
      month = "03";
      break;
    case "Apr":
      month = "04";
      break;
    case "May":
      month = "05";
      break;
    case "Jun":
      month = "06";
      break;
    case "Jul":
      month = "07";
      break;
    case "Aug":
      month = "08";
      break;
    case "Sep":
      month = "09";
      break;
    case "Oct":
      month = "10";
      break;
    case "Nov":
      month = "11";
      break;
    case "Dec":
      month = "12";
      break;
  }
  new_date += month;
  new_date += "-";
  new_date += dateList[2];
  return new_date;
}
