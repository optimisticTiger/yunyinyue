//发送ajax请求

/*
1.封装功能函数
  1.功能点明确
  2.函数内部应该保留固定代码（静态的）
  3.将动态的数据抽取成形参，由使用者根据自身情况动态的传入实参
  4.一个良好的函数应该设置函数的默认值

2.封装功能组件
  1.功能点明确
  2.组件内部应该保留固定代码（静态的）
  3.将动态的数据抽取成props参数，由使用者根据自身情况以标签属性的形式动态的传入props参数
  4.一个良好的组件应该设置组件的必要性和数据类型
*/ 
import config from './config'

export default (url, data={}, method='GET') => {
 return new Promise((resolve,reject) => {
  wx.request({
    url: config.host + url,
    data,
    method,
    header: {
      cookie: wx.getStorageSync('cookies')?wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1):''
    },
    success: (res) => {
      // console.log('请求成功:',res);
      if(data.isLogin){//为登录请求
        //将用户的cookie存储
        wx.setStorage({
          data: res.cookies,
          key: 'cookies',
        })
      }
      resolve(res.data);
    },
    fail: (err) => {
      console.log('请求失败:',err);
      reject(err);
    }
  })
 })
}