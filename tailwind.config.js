module.exports = {
  content: ["./views/**/*",
  "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {},
    container: {
      center: true,
    },
    fontFamily: {
      'logo' : ['Knewave']
    },
  },
  plugins: [
     require('flowbite/plugin')
  ],
}
