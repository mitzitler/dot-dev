package main

import (
	"fmt"
	"net/http"
	"os"
	"unicode/utf8"

	"github.com/mitzitler/mitzi-dot-dev/backend/cache"
	"github.com/mitzitler/mitzi-dot-dev/backend/internal/middleware"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"github.com/gin-contrib/cors"
	goaway "github.com/TwiN/go-away"
)

var (
	redisCache = cache.NewRedisCache("localhost:6379", 0, 1)
	rdb        = redis.NewClient(&redis.Options{Addr: "localhost:6379"})
)
const (
	maxMsgLength = 28 
	maxNameLength = 6 
)
func main() {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173"}, // also the actual dev website
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Content-Type"},
	}))
	
	r.POST("/guestbook", middleware.RateLimit(rdb, 5, 60), func(ctx *gin.Context) {
		var marqueemessage cache.MarqueeMessage
		if err := ctx.ShouldBind(&marqueemessage); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(), 
			})
			return
		}
		// check length
		lenMsg := utf8.RuneCountInString(marqueemessage.Msg)
		lenName := utf8.RuneCountInString(marqueemessage.Name)
		if lenMsg == 0 || lenName == 0 || lenMsg > maxMsgLength || lenName > maxNameLength {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error": "name or message is empty or too long",
			})
			return
		}
		// check profanity
		profaneMsg := goaway.IsProfane(marqueemessage.Msg)
		profaneName := goaway.IsProfane(marqueemessage.Name)
		if profaneMsg || profaneName {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error": "please keep it friendly",
			})
			return
		}

		res, err := redisCache.CreateMessage(&marqueemessage)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{
			"marqueemessage": res,
		})
	})

	r.GET("/guestbook", func(ctx *gin.Context){
		marqueemessages, err := redisCache.GetMessages()
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{
			"marqueemessages": marqueemessages,
		})
	})

	r.GET("/guestbook/:id", func(ctx *gin.Context) {
		id := ctx.Param("id")
		marqueemessage, err := redisCache.GetMessage(id)
		if err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{
				"message": "marquee message not found",
			})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{
			"marqueemessage": marqueemessage,
		})
	})

	r.PUT("/guestbook/:id", func(ctx *gin.Context) {
		id := ctx.Param("id")
		res, err := redisCache.GetMessage(id)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		var marqueemessage cache.MarqueeMessage

		if err := ctx.ShouldBind(&marqueemessage); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		res.Name = marqueemessage.Name
		res.Msg = marqueemessage.Msg
		res, err = redisCache.UpdateMessage(res)

		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{
			"marqueemessage": res,
		})
	})

	// wipe the whole guestbook; needs X-Admin-Token == $GUESTBOOK_ADMIN_TOKEN.
	// X-Admin-Token is deliberately not in CORS AllowHeaders, so browsers can't send it.
	r.DELETE("/guestbook", middleware.RequireAdmin(os.Getenv("GUESTBOOK_ADMIN_TOKEN")), func(ctx *gin.Context) {
		if err := redisCache.DeleteMessages(); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{
			"message": "all marquee messages deleted",
		})
	})

	r.DELETE("/guestbook/:id", func(ctx *gin.Context) {
		id := ctx.Param("id")
		err := redisCache.DeleteMessage(id)
		if err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{
				"error": err.Error(),
			})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{
			"message": "marquee message deleted successfully",
		})
	})

	fmt.Println(r.Run(":8080"))
}