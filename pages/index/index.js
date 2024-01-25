// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
import { point } from '@turf/helpers'
import distance from '@turf/distance'

Component({
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    location: {
      isHighAccuracy:false,
      distan:100,// 范围100米
      accuracy:undefined,
      latitude:40.0609839657929,//纬度
      longitude:116.61063387990693,// 经度
      chooseType:'poi',
      isOutOfRange:false,// 是否超出范围
      desAddress:'',
      desLatitude:40.0608839657929,// 设置的打卡中心纬度
      desLongitude:116.61453387990693,// 设置的打卡中心经度
    },
    markers:[{
        id: 1,
        latitude: 40.0608839657929,
        longitude: 116.61453387990693,
        iconPath: '/images/location.png',
        width:50,
        height:50,
        customCallout: {
          anchorY: 0,
          anchorX: 0,
          display: 'ALWAYS'
        },
    },{
      id: 2,
      latitude: 40.0609839657929,
      longitude: 116.61063387990693,
      iconPath: '/images/location.png',
      width:50,
      height:50,
      customCallout: {
        anchorY: 0,
        anchorX: 0,
        display: 'ALWAYS'
      },
  }],
    circles:[]
  },
  methods: {
    // 事件处理函数
    bindViewTap() {
      wx.navigateTo({
        url: '../logs/logs'
      })
    },
    onChooseAvatar(e) {
      const { avatarUrl } = e.detail
      const { nickName } = this.data.userInfo
      this.setData({
        "userInfo.avatarUrl": avatarUrl,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    onInputChange(e) {
      const nickName = e.detail.value
      const { avatarUrl } = this.data.userInfo
      this.setData({
        "userInfo.nickName": nickName,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    getUserProfile(e) {
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      wx.getUserProfile({
        desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.log(res)
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    },
    onDistanceChange(e){
      this.setData({
        "location.distan": e.detail.value || 100,
        circles:[{
          latitude: this.data.location.desLatitude,
          longitude: this.data.location.desLongitude,
          color:"#00ff00",
          fillColor:"#00ff004d",
          radius:e.detail.value || 100
        }]
      })
    },
    radioChange(e){
      this.setData({
        "location.isHighAccuracy": e.detail.value==="true"
      })
    },
    chooseTypeChange(e){
      this.setData({
        "location.chooseType": e.detail.value
      })
    },
    getLocation(e){
      let that = this
      // 获取位置
      wx.getLocation({
        type: 'gcj02', //返回可以用于wx.openLocation的经纬度
        isHighAccuracy:this.data.location.isHighAccuracy,
        highAccuracyExpireTime:3500,
        success (res) {
          console.log(res)
          that.setData({
            "location.latitude":res.latitude,
            "location.longitude":res.longitude,
            "location.accuracy":res.accuracy,
            markers:[...that.data.markers,{
                id: 2,
                latitude: res.latitude,
                longitude: res.longitude,
                iconPath: '/images/location.png',
                customCallout: {
                  anchorY: 0,
                  anchorX: 0,
                  display: 'ALWAYS'
                },
            }]
          });
          
        }
       })

       //打印wifi信息
       wx.getConnectedWifi({
        partialInfo:true,
        success(res){
          console.log(res);
        }
       })
    },
    chooseLocation(e){
      let that = this
      if(this.data.location.chooseType === 'map'){
        wx.chooseLocation({
          success(res){
            console.log(res)
            that.setData({
              "location.desLatitude": res.latitude,
              "location.desLongitude":res.longitude,
              "location.desAddress":res.address,
              markers:[
                {
                  id: 1,
                  latitude: res.latitude,
                  longitude: res.longitude,
                  iconPath: '/images/location.png',
                  customCallout: {
                    anchorY: 0,
                    anchorX: 0,
                    display: 'ALWAYS'
                  },
                }
              ],
              circles:[{
                latitude: that.data.location.desLatitude,
                longitude: that.data.location.desLongitude,
                color:"#00ff00",
                fillColor:"#00ff004d",
                radius:e.detail.value || 100
              }]
            })
          },
          fail(res){
            console.log(res)
          },
          complete(res){
            console.log(res)
          }
        })
      }else{
        wx.choosePoi({
          success(res){
            console.log('success',res)
            that.setData({
              "location.desLatitude": res.latitude,
              "location.desLongitude":res.longitude,
              "location.desAddress":res.address
            })
          },
          fail(res){
            console.log("fail",res)
          },
          complete(res){
            console.log("complete",res)
          }
        })
      }
    },
    openLocation(e){
      wx.openLocation({
        // latitude:40.06696,//this.data.location.latitude,
        // longitude:116.62099,//this.data.location.longitude,
        latitude:30.546729,//this.data.location.latitude,
        longitude:104.068059,//this.data.location.longitude,
        scale: 18
      });
    },
    computePosition(e){
      let { latitude, longitude, desLatitude, desLongitude } = this.data.location;
      let from = point([longitude, latitude]);
      let to = point([desLongitude, desLatitude]);
      let options = { units: 'kilometers' };//公里
      let curDistance = distance(from, to, options);
      let metersDistance = curDistance * 1000;// 米
      console.log(metersDistance)
      this.setData({
        "location.isOutOfRange":true,
        "location.distan":metersDistance,
        "location.isOutOfRange":metersDistance > this.data.location.distan
      })
    },
    clickFn(evt){
      console.log(evt);
      wx.requestSubscribeMessage({
        tmplIds:["7mPQwjg6-8PJ6PU5PDazKJBl_WMBnePfMZ8cD5eu8Z0"],
        success(res){
          console.log(res)
          if(res['7mPQwjg6-8PJ6PU5PDazKJBl_WMBnePfMZ8cD5eu8Z0'] === 'reject'){
            console.log(123132)
          }
        },
        fail(res){
          console.log(res)
          console.log(100000000)
        }
      })
    },
    login(){
      wx.login({
        success: (res) => {
          console.log(res)
          // 获取到code,传到后台,调用 code2Session, 使用 code 换取 openid、unionid、session_key 等信息
          // 但是code有效期是5分钟，那怎么保证下发消息的时候openid的有效性
          // code有效期是5分钟,openid是唯一不变的
          if(res.code){
            let AppId = "wxd19c5b528ed3a18f";
            let AppSecret = "798879e43de63a33a5d46f18589b6102";
            let url = 'https://api.weixin.qq.com/sns/jscode2session';
            wx.request({
              url: `${url}?appid=${AppId}&secret=${AppSecret}&js_code=${res.code}&grant_type=authorization_code`,
              method:'GET',
              success(res){
                console.log(res)
              }
            })
          }
        },
      })
    },
    getPhoneNumber(e){
      console.log(e.detail.code)  // 动态令牌
      console.log(e.detail.errMsg) // 回调信息（成功失败都会返回）
      console.log(e.detail.errno)  // 错误码（失败时返回
    }
  }
})
