const doctorRoutes = require("../routes/doctorRoutes");

const routes = [];

doctorRoutes.stack.forEach((layer) => {
  if (layer.route) {
    routes.push({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods).join(",").toUpperCase(),
    });
  }
});

console.log(JSON.stringify(routes, null, 2));
