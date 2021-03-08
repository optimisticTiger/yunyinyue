import Pubsub from 'pubsub-js'
import request from '../../utils/request'
let isSend = false;//函数节流
Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholderContent: '',//搜索框默认内容
    hotList: [],//热搜榜数据
    searchContent: '',//用户输入的表单项数据
    searchList: [],//关键字模糊匹配数据
    historyList: [],//搜索历史记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取初始化数据
    this.getInitData();
    //获取本地历史记录的功能函数
    this.getsearchHistory();

    //订阅来自search页面发布的消息
    // Pubsub('toPlay',() => {
    //   let hotList = this.data;
    // })
  },
  //获取本地历史记录的功能函数
  getsearchHistory() {
    let historyList = wx.getStorageSync('searchHistory')
    if(historyList){
      this.setData({
        historyList
      })
    }
  },
  //获取初始化数据
  async getInitData() {
    let placeholderData = await request('/search/default')
    let hotListData = await request('/search/hot/detail')
    this.setData({
      placeholderContent: placeholderData.data.showKeyword,
      hotList: hotListData.data
    })
  },

  //表单项内容发生改变的回调
  handleInputChange(event) {
    // console.log(event)
    //更新searchContent的状态
    this.setData({
      searchContent: event.detail.value.trim()
    })
    //函数节流
    if(isSend){
      return;
    }
    isSend = true;

    this.getSearchList();
    setTimeout(async () => {
      isSend = false;
    },300)
    
  },
  //获取搜索数据的功能函数
  async getSearchList(){
    if(!this.data.searchContent) {
      this.setData({
        searchList: []
      })
      return;
    }
    //发请求获取关键字模糊匹配数据
    let {searchContent,historyList} = this.data;
    let searchListData = await request('/search',{keywords: searchContent,limit: 10});
    console.log(searchListData)
    this.setData({
      searchList: searchListData.result.songs
    })

    //将搜索记录添加到历史记录中
    if(historyList.indexOf(searchContent) !== -1){
      historyList.splice(historyList.indexOf(searchContent),1);
    }
    historyList.unshift(searchContent);
    this.setData({
      historyList
    })
    wx.setStorageSync('searchHistory', historyList)
  },

  //清空搜索内容
  clearSearchContent() {
    this.setData({
      searchContent: '',
      searchList: []
    })
  },

  //删除历史记录
  deleteSearchHistory(){
    wx.showModal({
      content: '确认删除历史记录？',
      success: (res) => {
        if(res.confirm){
          //1.清空data中的historyList
          this.setData({
            historyList: []
          })
          //2.清空本地历史记录缓存
          wx.removeStorageSync('searchHistory');
        }
      }
    })
    
  },

  isCancel() {
    this.setData({
      searchContent: ''
    })
  },

  // toSongDetailHot(event) {
  //   let song = event.currentTarget.dataset.song;
  //   wx.navigateTo({
  //     url:  '/pages/songDetail/songDetail?musicId=' + song.score
  //   })
  // },

  toSongDetailSearch(event) {
    let song = event.currentTarget.dataset.song;
    wx.navigateTo({
      url:  '/pages/songDetail/songDetail?musicId=' + song.id
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