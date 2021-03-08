import request from '../../utils/request'
// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [], //轮播图数据
    recommendList: [], //推荐歌单
    topList: [] //排行榜数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let bannerListData = await request('/banner',{type: 2});
    this.setData({
      bannerList: bannerListData.banners,
    })

    //获取推荐歌单数据
    let recommendListData = await request('/personalized',{limit: 10})
    this.setData({
      recommendList: recommendListData.result,
    })

    //获取排行榜数据
    let resultArr = [];
    let topListId = [19723756,3779629,2884035,3778678];
    let index = 0;
    for(index;index < 4;index++){
      let topListData = await request('/playlist/detail',{id: topListId[index]});
      // console.log('排行榜数据：',topListData.playlist.name);
      let topListItem = {
        name: topListData.playlist.name,
        tracks: topListData.playlist.tracks.slice(0,3)
      };
      resultArr.push(topListItem);

      this.setData({
        topList: resultArr,
      })
    }
    //放在此处会等循环体里数据全部拿到后才渲染，会长时间白屏  
    // this.setData({
    //   topList: resultArr,
    // })
  },

  toRecommentSong() {
    wx.navigateTo({
      url: '/pages/recommendSong/recommendSong',
    })
  },

  toVideo() {
    wx.navigateTo({
      url: '/pages/video/video',
    })
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