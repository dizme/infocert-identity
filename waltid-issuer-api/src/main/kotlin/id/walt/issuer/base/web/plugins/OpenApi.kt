package id.walt.issuer.base.web.plugins

import io.github.smiley4.ktorswaggerui.SwaggerUI
import io.github.smiley4.ktorswaggerui.data.AuthKeyLocation
import io.github.smiley4.ktorswaggerui.data.AuthType
import io.ktor.server.application.*

fun Application.configureOpenApi() {
    install(SwaggerUI) {
        swagger {
            swaggerUrl = "swagger"
            forwardRoot = true
        }
        info {
            title = "InfoCert Issuer API"
            version = "latest"
            description = "Interact with the InfoCert issuer"
        }
        server {
            url = "/"
            description = "Development Server"
        }

        securityScheme("authenticated") {
            type = AuthType.API_KEY
            location = AuthKeyLocation.COOKIE
        }

        defaultUnauthorizedResponse {
            description = "Invalid authentication"
        }
    }
}
