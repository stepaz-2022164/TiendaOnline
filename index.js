import { initServer } from "./configs/app.js"
import { connect } from "./configs/mongo.js"
import { defaultAdmin } from "./src/user/user.controller.js"

initServer()
connect()
defaultAdmin('Sergio', 'Tepaz', 'stepaz', '123456', 'stepaz@kinal.edu.gt', '87654321' )