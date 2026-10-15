
const fs = require("fs");
const path = require("path");

/*
  Karma utilizará el primer navegador que encuentre.
*/
const browserPaths = [
  process.env.PROGRAMFILES &&
    path.join(
      process.env.PROGRAMFILES,
      "Google",
      "Chrome",
      "Application",
      "chrome.exe"
    ),

  process.env["PROGRAMFILES(X86)"] &&
    path.join(
      process.env["PROGRAMFILES(X86)"],
      "Google",
      "Chrome",
      "Application",
      "chrome.exe"
    ),

  process.env.LOCALAPPDATA &&
    path.join(
      process.env.LOCALAPPDATA,
      "Google",
      "Chrome",
      "Application",
      "chrome.exe"
    ),

  process.env.PROGRAMFILES &&
    path.join(
      process.env.PROGRAMFILES,
      "Microsoft",
      "Edge",
      "Application",
      "msedge.exe"
    ),

  process.env["PROGRAMFILES(X86)"] &&
    path.join(
      process.env["PROGRAMFILES(X86)"],
      "Microsoft",
      "Edge",
      "Application",
      "msedge.exe"
    )
].filter(Boolean);

if (!process.env.CHROME_BIN) {
  const installedBrowser = browserPaths.find((browserPath) =>
    fs.existsSync(browserPath)
  );

  if (installedBrowser) {
    process.env.CHROME_BIN = installedBrowser;
  }
}

/*
  Configuración de Karma para ejecutar pruebas Jasmine
  sobre los componentes y funciones del proyecto React.
*/


module.exports = function (config) {
  config.set({
    // Carpeta desde donde Karma resolverá las rutas.
    basePath: "",

    // Framework para escribir las pruebas.
    frameworks: ["jasmine", "webpack"],

    // Archivos de pruebas que Karma debe buscar.
    files: [
      {
        pattern: "src/**/*.spec.js",
        watched: true
      },
      {
        pattern: "src/**/*.spec.jsx",
        watched: true
      }
    ],

    // Webpack transforma los archivos antes de ejecutarlos.
    preprocessors: {
      "src/**/*.spec.js": ["webpack"],
      "src/**/*.spec.jsx": ["webpack"]
    },

    webpack: {
      mode: "development",

      // Permite encontrar la línea original cuando ocurre un error.
      devtool: "inline-source-map",

      module: {
        rules: [
          {
            // Transforma JavaScript y JSX para que Chrome pueda ejecutarlos.
            test: /\.[jt]sx?$/,
            exclude: /node_modules/,

            use: {
              loader: "babel-loader",

              options: {
                presets: [
                  [
                    "@babel/preset-env",
                    {
                      targets: "defaults"
                    }
                  ],
                  [
                    "@babel/preset-react",
                    {
                      runtime: "automatic"
                    }
                  ]
                ],

                // Registra qué partes del código fueron ejecutadas.
                plugins: [
                  [
                    "babel-plugin-istanbul",
                    {
                      exclude: [
                        "**/*.spec.js",
                        "**/*.spec.jsx",
                        "src/main.jsx"
                      ]
                    }
                  ]
                ]
              }
            }
          },
          {
            // Permite importar archivos CSS desde los componentes.
            test: /\.css$/i,
            use: ["style-loader", "css-loader"]
          },
          {
            // Permite procesar imágenes y tipografías.
            test: /\.(png|jpe?g|gif|svg|woff2?|ttf|otf)$/i,
            type: "asset/resource"
          }
        ]
      },

      resolve: {
        extensions: [".js", ".jsx"]
      }
    },

    webpackMiddleware: {
      stats: "errors-only"
    },

    // Muestra resultados y genera el informe de cobertura.
    reporters: ["progress", "coverage"],

    coverageReporter: {
      dir: "coverage",
      reporters: [
        {
          type: "html",
          subdir: "html"
        },
        {
          type: "text-summary"
        }
      ]
    },

    // Ejecuta las pruebas sin abrir una ventana visible.
    browsers: ["ChromeHeadless"],

    // Ejecuta una vez y termina.
    singleRun: true,
    autoWatch: false,

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    captureTimeout: 60000,
    browserNoActivityTimeout: 60000,
    concurrency: Infinity
  });
};