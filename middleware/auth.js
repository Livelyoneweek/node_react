const {User} = requrie('../models/User');

let auth = (req,res,next) => {
    // 인증 처리 하는 곳

    //클라이언트 쿠키가져옴
    let token = req.cookie.x_auth;

    //토큰을 복호화 한 후 유저 찾음
    User.findByToken(token, (err,user) => {
        if(err) throw err;
        if(!user) return res.json({isAuth: false, error:true})
        req.token = token;
        req.user = user;
        next();
    })
}

module.exports = {auth};