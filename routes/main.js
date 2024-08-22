__path = process.cwd()

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

require('../settings');
const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../controller/passportLocal')(passport);
const authRoutes = require('./auth');
const apiRoutes = require('./api')
const dataweb = require('../model/DataWeb');
const User = require('../model/user');
const fs = require('fs')
const chalk = require('chalk')

//_______________________ ┏ Function ┓ _______________________\\

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        next();
    } else {
        req.flash('error_messages', "Please Login to continue !");
        res.redirect('/login');
    }
}

async function getApikey(id) {
    let limit = await dataweb.findOne();
    let users = await User.findOne({_id: id})
    return {apikey: users.apikey, username: users.username, checklimit: users.limitApikey, isVerified : users.isVerified, prem: users.isPremium, RequestToday: limit.RequestToday};
}


//_______________________ ┏ Router ┓ _______________________\\

router.get('/', (req, res) => {
        res.render("home");
});

router.get('/docs',  checkAuth, async (req, res) => {
  let getinfo =  await getApikey(req.user.id)
  let { apikey, username, checklimit, isVerified , prem, RequestToday } = getinfo
    res.render("docs", { username: username, verified: isVerified, apikey: apikey, limit: checklimit , premium: prem, RequestToday: RequestToday });
    
});

router.get('/profile',  checkAuth, async (req, res) => {
  let getinfo =  await getApikey(req.user.id)
  let { apikey, username, checklimit, isVerified , prem, RequestToday } = getinfo
    res.render("profile", { username: username, verified: isVerified, apikey: apikey, limit: checklimit , premium: prem, RequestToday: RequestToday });
    
});

router.get('/ai', async (req, res) => {
    res.render("ai");
});

router.get("/logout", (req, res) => {
    req.logout(req.user, err => {
      if(err) return next(err);
      req.flash('success_messages', 'logout success');
      res.redirect("/login");
    });
  });



router.use(authRoutes);
router.use(apiRoutes);
module.exports = router;


let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})
