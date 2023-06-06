const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');

const {auth} = require("./middleware/auth")
const {User} = require("./models/User");

// application/x-www-form-urlencoded 으로 온거 분석
app.use(bodyParser.urlencoded({extended: true}));

// apllciation/json 으로 온거 분석
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(()=> console.log("MongoDB Connected.."))
.catch(err => console.log(err))


app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.get('/api/hello', (req, res) => {
  res.send('Hello client!')
})


app.post('/api/user/register', (req, res) => {
    //회원 가입 정보
    const user = new User(req.body)
    user.save()
    .then(userInfo => {
        return res.status(200).json({
        success: true
        });
    })
    .catch(err => {
        return res.json({ success: false, err });
    });
})

app.post('/api/user/login',(req, res) =>{
  // 요청된 이메일을 데이터베이스 찾기
  User.findOne({email: req.body.email})
  .then(docs=>{
      if(!docs){
          return res.json({
              loginSuccess: false,
              messsage: "제공된 이메일에 해당하는 유저가 없습니다."
          })
      }
      docs.comparePassword(req.body.password, (err, isMatch) => {
          if(!isMatch) return res.json({loginSuccess: false, messsage: "비밀번호가 틀렸습니다."})
          // Password가 일치하다면 토큰 생성
          docs.generateToken((err, user)=>{
              if(err) return res.status(400).send(err);
              // 토큰을 저장
              res.cookie("x_auth", user.token)
              .status(200)
              .json({loginSuccess: true, userId: user._id})
          })
      })
  })
  .catch((err)=>{
      return res.status(400).send(err);
  })
})


app.get('/api/user/auth',auth, (req,res) => {
  //auth 미들웨어 통과 후 
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role===0 ? false: true,
    isAuth: true,
    email: req.user.email,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})

app.get('/api/user/logout',auth,(req,res) => {
  User.findOneAndUpdate({_id:req.user._id},
    {token:""}
    ,(err,user) => {
      if(err) return res.json({success:false, err});
      return res.status(200).send({
        success:true
      })
    })
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})