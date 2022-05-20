module.exports = {
  content: ["./views/**/*",
  "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {},
    container: {
      center: true,
    },
  },
  plugins: [
     require('flowbite/plugin')
  ],
}
