package middleware

import (
	"context"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

const fixedWindowScript = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
	redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return count
`

func allow(ctx context.Context, rdb *redis.Client, key string, limit, windowSeconds int) (bool, error) {
	script := redis.NewScript(fixedWindowScript)
	count, err := script.Run(ctx, rdb, []string{key}, windowSeconds).Int()
	if err != nil {
		return false, err
	}
	return count <= limit, nil 
}

func RateLimit(rdb *redis.Client, limit, windowSeconds int) gin.HandlerFunc {
	return func(c *gin.Context) {
		key := fmt.Sprintf("rl:%s", c.ClientIP())
		ok, err := allow(c.Request.Context(), rdb, key, limit, windowSeconds)
		if err != nil {
			// fail open
			c.Next()
			return
		}
		if !ok {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "too many messages!",
			})
			return
		}
		c.Next()
	}
}

// func RedisRateLimiter(rdb *redis.Client, ip) {
// 	ctx := context.Background()
// 	limiter := NewTokenBucket(TokenBucketConfig{
// 		Client: rdb,
// 		Capacity: 3,
// 		RefillRate: 30,
// 		RefillInterval: time.Second,
// 	})
// 	allowed, remaining, err := limiter.Allow(ctx, "user:123") // limit by ip address
// 	if err != nil {
// 		log.Fatalf("rate limiter error: %v", err)
// 	}

// 	if allowed {
// 		fmt.Printf("Request allowed. %.0f tokens remaining\n", remaining)
// 	} else {
// 		fmt.Println("Request deniend. Rate limit exceeded")
// 		// return 429
// 	}
// }