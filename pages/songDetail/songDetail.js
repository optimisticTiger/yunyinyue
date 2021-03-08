import PubSub from 'pubsub-js';
import moment from 'moment';
import request from '../../utils/request'
//获取全局实例
const appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false,//标识音乐是否播放
    song: {},//歌曲详情对象
    musicId: '',//音乐的id
    musicLink: '',//音乐的链接
    currentTime: '00:00',//实时时长
    durationTime: '00:00',//总时长
    currentWidth: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  //options:用于接收路由跳转传来的query参数
  //原生小程序路由传参对传入参数的长度有限制，超出会自动截取
  // console.log(JSON.parse(options.song));
    let musicId = options.musicId;
    // console.log(options)
    // console.log(musicId) 
    this.setData({
      musicId
    })
    this.getMusicInfo(musicId);
    /**
     * 问题：解决用户点击系统栏暂停，播放按钮与页面动画显示不一致
     * 1.通过控制音频的实例backgroundAudioManager去监听音乐的播放，暂停
     */
    //判断当前页面音乐是否在播放
    if(appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId) {
      //修改当前页面音乐播放为true
      this.setData({
        isPlay: true
      })
    }

    //创建控制音乐播放的实例
    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    //监视音乐的播放，暂停,停止
    this.backgroundAudioManager.onPlay(() => {
      //修改音乐是否播放的状态
      this.changePlayState(true);
      //修改全局音乐播放状态
      appInstance.globalData.musicId = musicId;
    });
    this.backgroundAudioManager.onPause(() => {
      //修改音乐是否播放的状态
      this.changePlayState(false);
    });
    this.backgroundAudioManager.onStop(() => {
      //修改音乐是否播放的状态
      this.changePlayState(false);
    });
    //监听音乐播放结束
    this.backgroundAudioManager.onEnded(() => {
      // console.log('end')
      //播放结束，自动切换到下一首播放
      PubSub.publish('switchType','next');
      //将实时进度条还原为0
      this.setData({
        currentWidth: 0,
        currentTime: '00:00'
      })
    });

    //监听播放的实时进度
    this.backgroundAudioManager.onTimeUpdate(() => {
      //格式化播放的实时时间
      let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss')
      let currentWidth = this.backgroundAudioManager.currentTime / this.backgroundAudioManager.duration * 450
      this.setData({
        currentTime,
        currentWidth
      })
    })
  },
  //修改播放状态的功能函数
  changePlayState(isPlay) {
    this.setData({
      isPlay
    })
    //修改全局音乐播放状态
    appInstance.globalData.isMusicPlay = isPlay;
  },
  //获取音乐详情数据的功能函数
  async getMusicInfo(musicId) {
    let songData = await request('/song/detail',{ids: musicId});
    let durationTime = moment(songData.songs[0].dt).format('mm:ss');
    this.setData({
      song: songData.songs[0],
      durationTime
    })
    //动态修改窗口标题
    wx.setNavigationBarTitle({
      title: this.data.song.name,
    })
  },
  //点击播放、暂停的回调
  handleMusicPlay() {
    let isPlay = !this.data.isPlay;
    //修改是否播放的状态
    this.setData({
      isPlay
    })
    let {musicId,musicLink} = this.data;
    this.musicControl(isPlay,musicId,musicLink);
  },
  //点击播放、暂停的功能函数
  async musicControl(isPlay,musicId, musicLink) {
    if(isPlay){
      if(!musicLink) {
        //获取音乐播放链接
        let musicLinkData = await request('/song/url',{id: musicId});
        musicLink = musicLinkData.data[0].url;

        this.setData({
          musicLink
        })
      }
      this.backgroundAudioManager.src = musicLink;
      this.backgroundAudioManager.title =  this.data.song.name;
    }else {
      this.backgroundAudioManager.pause();
    }
  },
  //点击切歌的回调
  handleSwitch(event) {
    let type = event.currentTarget.id;
    //关闭当前播放音乐
    this.backgroundAudioManager.stop();
    //订阅来自recommendSong页面发布的消息
    PubSub.subscribe('musicId',(msg,musicId) => {
      // console.log(musicId);
      //获取音乐的详情信息
      this.getMusicInfo(musicId);
      //自动播放当前音乐
      this.musicControl(true,musicId);
      //取消订阅
      PubSub.unsubscribe('musicId');
    })   
    //发布消息给recommendSong页面
    PubSub.publish('switchType',type);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})