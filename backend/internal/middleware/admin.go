package middleware

import (
	"crypto/subtle"
	"net/http"

	"github.com/gin-gonic/gin"
)

// RequireAdmin only lets a request through if its X-Admin-Token header matches
// token. An empty token (env var not set) rejects everything, so forgetting to
// configure it fails closed instead of leaving the route open.
func RequireAdmin(token string) gin.HandlerFunc {
	return func(c *gin.Context) {
		given := c.GetHeader("X-Admin-Token")
		// constant-time compare so response timing doesn't leak the token
		if token == "" || subtle.ConstantTimeCompare([]byte(given), []byte(token)) != 1 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "unauthorized",
			})
			return
		}
		c.Next()
	}
}
