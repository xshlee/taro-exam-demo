export default defineAppConfig({
  pages: [
    'pages/question-one/index',
    'pages/question-two/index'
  ],
  tabBar: {
    color: '#999999',
    selectedColor: '#ff4d4f',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/question-one/index',
        text: '题目一'
      },
      {
        pagePath: 'pages/question-two/index',
        text: '题目二'
      }
    ]
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '题目',
    navigationBarTextStyle: 'black'
  }
})
