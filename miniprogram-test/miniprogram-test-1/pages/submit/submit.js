// pages/submit/submit.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    logs:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.getdata();
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
    var the = this;
    this.setData({
      keywords:this.options.k
    });
    wx.request({
      url: 'https://second.wangjiaqi.top/ask?kwd='+the.data.keywords,
      success: function (res) {
        if(res.data.status !='ok'){
          the.setData({
            tech_content:res.data.errmsg
          });
          return ;
        }
        var content='';
        for(var  i=0;i<res.data.data.length;i++){
          content += `<div class="content-list">
                      <p>${res.data.data[i]}</p>
                      </div><br>`;
        }
        the.setData({
          tech_content:content
        });
      }
    });
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

  },

//   getdata: function () {
//     var that = this;   // 这个地方非常重要，重置data{}里数据时候setData方法的this应为以及函数的this, 如果在下方的sucess直接写this就变成了wx.request()的this了
//     wx.request({
//       url: 'https://second.wangjiaqi.top',
//       data: {},
//       header: {
//         "Content-Type": "applciation/json"
//       },
//       method: "GET",//get为默认方法/POST
//       success: function (res) {
//         console.log(res.data);
//       　that.setData({
//           logs: res.data,
//         })
//       },
//     })
// }

})