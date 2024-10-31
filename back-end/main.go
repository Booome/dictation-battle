package main

import (
	"fmt"
	"log"
	"math/rand/v2"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

const PORT = ":8041"

func main() {
	godotenv.Load()

	r := gin.Default()

	frontendUrl := os.Getenv("FRONTEND_URL")
	if frontendUrl == "" {
		log.Fatal("FRONTEND_URL is not set")
	}

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{frontendUrl},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	dataPath := getDataPath()
	if _, err := os.Stat(dataPath); os.IsNotExist(err) {
		fmt.Println("dataPath not exist")
	}

	r.GET("/files/preview", handlePreview)

	if err := r.Run(PORT); err != nil {
		log.Fatal("Run server error:", err)
	}
}

func getDataPath() string {
	path := os.Getenv("DATA_PATH")

	if path == "" {
		path = "~/.dictation-battle/"
	}

	if path[0] == '~' {
		path = os.Getenv("HOME") + path[1:]
	}

	return path
}

type FilePreview struct {
	Id       string `json:"id"`
	Content  string `json:"content"`
	NumWords int    `json:"num_words"`
}

func handlePreview(c *gin.Context) {
	count, err := strconv.Atoi(c.Query("count"))
	if err != nil || count <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "count is required",
		})
		return
	}

	dataPath := getDataPath()
	files, err := os.ReadDir(filepath.Join(dataPath, "targets"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "read dir error",
		})
	}

	rand.Shuffle(len(files), func(i, j int) {
		files[i], files[j] = files[j], files[i]
	})

	if count > len(files) {
		count = len(files)
	}

	files = files[:count]

	previews := make([]FilePreview, count)
	for i, file := range files {
		content, err := os.ReadFile(filepath.Join(dataPath, "targets", file.Name()))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "read file error",
			})
		}
		numWords := len(strings.Split(string(content), " "))

		previews[i] = FilePreview{
			Id:       file.Name(),
			Content:  string(content)[:256],
			NumWords: numWords,
		}
	}

	c.JSON(http.StatusOK, previews)
}
