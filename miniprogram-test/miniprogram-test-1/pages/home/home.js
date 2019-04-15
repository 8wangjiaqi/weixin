// pages/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getBatteryInfo({
      success: res => {
        this.setData({
          batteryInfo: res.level
        });
      }
    });

    wx.getSystemInfo({
      success: res => {
        this.setData({
          sys: res
        });
      },
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
    // wx.getBatteryInfo({
    //   success:res=>{
    //     this.setDate({
    //       batteryInfo:res.level
    //     });
    //   }
    // });

    // wx.getSystemInfo({
    //   success: res=>{
    //     this.setDate({
    //       sys:res
    //     });
    //   },
    // })
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

  },

  goIndex: function () {
    wx.navigateTo({
      url: '/pages/index/index',
    })
  },
  
  goIndex1: function () {
    wx.navigateTo({
      url: '/pages/submit/submit',
    })
  },
  goIndex2: function () {
    wx.navigateTo({
      url: '/pages/logs/logs',
    })
  },
  setKeyword(e) {
    this.data.keywords = e.detail.value;
    console.log(e.detail.value);
  },
  AskSubmit(e) {
    wx.navigateTo({
      url: '/pages/submit/submit?k='+this.data.keywords,
    });
  },
  chooseImage:function(){
    var the=this;
    wx.chooseImage({
      success: function(res) {
        the.setData({
          images:res.tempFilePaths
        });
      },
    })
  },

  takePhoto:function(){
    var t=wx.createCameraContext();
    t.takePhoto({
      success:(res)=>{
        this.setData({
          photoImg:res.tempImagePath
        });
      }
    });
  }


})
