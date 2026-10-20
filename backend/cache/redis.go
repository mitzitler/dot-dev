package cache

import (
	"encoding/json"
	"errors"
	"time"
	"context"

	"github.com/redis/go-redis/v9"
	"github.com/google/uuid"
)

type MarqueeMessage struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Msg       string    `json:"msg"`
	CreatedAt time.Time `json:"created_at"`
}

type MarqueeMessageService interface {
	GetMessage(id string) (*MarqueeMessage, error)
	GetMessages() ([]*MarqueeMessage, error)
	CreateMessage(marqueemessage *MarqueeMessage) (*MarqueeMessage, error)
	UpdateMessage(marqueemessage *MarqueeMessage) (*MarqueeMessage, error)
	DeleteMessage(id string) error
}

// does this go here?
type redisCache struct {
	host string
	db int 
	exp time.Duration
}

func NewRedisCache(host string, db int, exp time.Duration) MarqueeMessageService {
	return &redisCache{
		host: host,
		db: db,
		exp: exp,
	}
}

func (cache redisCache) getClient() *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr: cache.host,
		Password: "",
		DB: cache.db,
	})
}

func (cache redisCache) CreateMessage(marqueemessage *MarqueeMessage) (*MarqueeMessage, error) {
	ctx := context.Background()
	c := cache.getClient()
	marqueemessage.ID = uuid.New().String()
	marqueemessage.CreatedAt = time.Now().UTC()
	json, err := json.Marshal(marqueemessage)
	if err != nil {
		return nil, err
	}
	if err := c.HSet(ctx, "marqueemessages", marqueemessage.ID, json).Err(); err != nil {
		return nil, err
	}
	return marqueemessage, nil
}

func (cache redisCache) GetMessage(id string) (*MarqueeMessage, error) {
	ctx := context.Background()
	c := cache.getClient()
	val, err := c.HGet(ctx, "marqueemessages", id).Result()
	if err != nil {
		return nil, err
	}
	marqueemessage := &MarqueeMessage{}
	err = json.Unmarshal([]byte(val), marqueemessage)
	if err != nil {
		return nil, err
	}
	return marqueemessage, nil
}

func (cache redisCache) GetMessages() ([]*MarqueeMessage, error) {
	ctx := context.Background()
	c := cache.getClient()
	marqueemessages := []*MarqueeMessage{}
	val, err := c.HGetAll(ctx, "marqueemessages").Result()
	if err != nil {
		return nil, err
	}
	for _, item := range val {
		marqueemessage := &MarqueeMessage{}
		err := json.Unmarshal([]byte(item), marqueemessage)
		if err != nil {
			return nil, err
		}
		marqueemessages = append(marqueemessages, marqueemessage)
	}

	return marqueemessages, nil
}

func (cache redisCache) UpdateMessage(marqueemessage *MarqueeMessage) (*MarqueeMessage, error) {
	ctx := context.Background()
	c := cache.getClient()
	json, err := json.Marshal(&marqueemessage)
	if err != nil {
		return nil, err
	}
	if err := c.HSet(ctx, "marqueemessages", marqueemessage.ID, json).Err(); err != nil {
		return nil, err
	}
	return marqueemessage, nil
}

func (cache redisCache) DeleteMessage(id string) error {
	ctx := context.Background()
	c := cache.getClient()
	numDeleted, err := c.HDel(ctx, "marqueemessages", id).Result()
	if numDeleted == 0 {
		return errors.New("message to delete not found")
	}
	if err != nil {
		return err
	}
	return nil
}