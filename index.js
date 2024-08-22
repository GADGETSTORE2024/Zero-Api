//_______________________ ┏  Info  ┓ _______________________\\
//
//   Credit : AlipBot
//
//   Note
//   Jangan Jual SC ini ,
//   Jangan Buang Text ini,
//   Siapa Mahu Upload Jangan Lupa Credit :),
//   Siapa Tidak Letak Credit Akan Ambil Tindakan
//
//_______________________ ┏ Make By AlipBot ┓ _______________________\\

//―――――――――――――――――――――――――――――――――――――――――― ┏  Modules ┓ ―――――――――――――――――――――――――――――――――――――――――― \\

require("./settings");
const express = require("express");
const app = express();
const favicon = require("serve-favicon");
const path = require("path");
const cookieParser = require("cookie-parser");
const createError = require("http-errors");
const mongoose = require("mongoose");
const expressSession = require("express-session");
const MemoryStore = require("memorystore")(expressSession);
const passport = require("passport");
const flash = require("connect-flash");
const csrf = require("csurf");
const cron = require("node-cron");
const moment = require("moment-timezone");
const bodyParser = require("body-parser");
const User = require("./model/user");
const dataweb = require("./model/DataWeb");
const ms = require("ms");
const fs = require('fs')
const chalk = require('chalk')

//_______________________ ┏ Funtion ┓ _______________________\\
async function resetPremium() {
  try {
    const currentTime = moment().tz('Asia/Jakarta');
    
    // Find users with expired premium status
    const expiredUsers = await User.find({ isPremium: true, expired: { $lt: currentTime.toDate() } });

    // Update premium status for expired users
    for (const user of expiredUsers) {
      await User.updateOne({ _id: user._id }, {
        $set: {
          isPremium: false,
          expired: null,
          // Add other fields as needed
        }
      });
    }

    //console.log("RESET PREMIUM DONE");
  } catch (error) {
    console.error('Error resetting premium:', error);
  }
}

async function resetapi() {
  await User.updateMany({ isPremium: false }, { $set: { limitApikey: LimitApikey } });
  console.log("RESET LIMIT DONE");
}

// Fungsi untuk mereset limit API hanya untuk pengguna premium
async function resetPremiumApi() {
  try {
    // Temukan pengguna premium dan reset limit API mereka
    await User.updateMany({ isPremium: true }, { $set: { limitApikey: LimitPrem } });
    console.log("RESET PREMIUM API LIMIT DONE");
  } catch (error) {
    console.error('Error resetting premium API limit:', error);
  }
}

async function ResetRequestToday() {
  await dataweb.updateOne(
    {},
    {
      RequestToday: 0,
    }
  );
  console.log("RESET Request Today DONE");
}

//_______________________ ┏ Code ┓ _______________________\\

(cors = require("cors"));
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));
var main = require("./routes/main"),
  api = require("./routes/api");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//_______________________ ┏ Connect Database ┓ _______________________\\

mongoose.set("strictQuery", false);
mongoose
  .connect(keymongodb, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected !");
    let limit = await dataweb.findOne();
    if (limit === null) {
      let obj = { RequestToday: 0 };
      await dataweb.create(obj);
      console.log("DATA WEBSITE Sussces Create");
    }
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

//_______________________ ┏ CronJob For Reset Limit ┓ _______________________\\

// Reset Expired Premium Setiap Hari
cron.schedule(
  "0 0 * * *",
  () => {
    resetPremium();
  },
  {
    scheduled: true,
    timezone: "Asia/Jakarta",
  }
);

// Reset Request Today Setiap Hari
cron.schedule(
  "0 0 * * *",
  () => {
    ResetRequestToday();
  },
  {
    scheduled: true,
    timezone: "Asia/Jakarta",
  }
);

//Reset All User Apikey Limit setiap Hari
cron.schedule(
  "0 0 * * *",
  () => {
    resetapi();
    resetPremiumApi();
  },
  {
    scheduled: true,
    timezone: "Asia/Jakarta",
  }
);

//_______________________ ┏ Code ┓ _______________________\\

/*app.use(
  expressSession({
    secret: "RestApi",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
//      secure: true, // true if using HTTPS
//      httpOnly: true,
//      sameSite: "lax", // or 'strict'/'none' based on your requirement
    },
    store: new MemoryStore({
      checkPeriod: 30 * 24 * 60 * 60 * 1000, // prune expired entries every 30 days
    }),
  })
);*/

app.use(
  expressSession({
    secret: "RestApi",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: ms("30d"), // 30 days
//      secure: true, // true if using HTTPS
//      httpOnly: true,
//      sameSite: "lax", // or 'strict'/'none' based on your requirement
    },
    store: new MemoryStore({
      checkPeriod: ms("20d"), // prune expired entries every 30 days
    }),
  })
);

app.use(csrf());
app.use(passport.initialize());
app.use(express.static("public"));
app.use(passport.session());
app.set("trust proxy", true);
app.set("json spaces", 2);
app.use(cors());
app.use(flash());
app.use(function (req, res, next) {
  res.locals.success_messages = req.flash("success_messages");
  res.locals.error_messages = req.flash("error_messages");
  res.locals.error = req.flash("error");
  next();
});
app.use("/", main);
app.use("/", api);
app.use(function (req, res, next) {
  next(createError(404));
});
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render("404");
});

//_______________________ ┏ Make By AlipBot ┓ _______________________\\

//module.exports = app;

const PORT = 3000;
app.listen(PORT, () => {
console.log(`
@BAWORBAWORID

Server running on http://localhost:` + PORT)
console.log(`Hello ${creator}`)
});

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})
