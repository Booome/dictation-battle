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

	r.GET("/targets/preview", handlePreview)
	r.GET("/targets/:id", handleTarget)
	r.GET("/assets/:file", handleAssert)

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
	Id      string `json:"id"`
	Content string `json:"content"`
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
		return
	}

	var filteredFiles []os.DirEntry
	for _, file := range files {
		if filepath.Ext(file.Name()) == ".md" {
			filteredFiles = append(filteredFiles, file)
		}
	}
	files = filteredFiles

	rand.Shuffle(len(files), func(i, j int) {
		files[i], files[j] = files[j], files[i]
	})

	if count > len(files) {
		count = len(files)
	}

	files = files[:count]

	previews := make([]string, count)
	for i, file := range files {
		previews[i] = strings.TrimSuffix(file.Name(), ".md")
	}

	c.JSON(http.StatusOK, previews)
}

func handleTarget(c *gin.Context) {
	id := c.Param("id")

	dataPath := getDataPath()
	filePath := filepath.Join(dataPath, "targets", id+".md")

	content, err := os.ReadFile(filePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "read file error",
		})
		return
	}

	c.Header("Content-Type", "text/plain; charset=utf-8")
	c.String(http.StatusOK, string(content))
}

func getContentType(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	switch ext {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".gif":
		return "image/gif"
	case ".mp3":
		return "audio/mpeg"
	case ".wav":
		return "audio/wav"
	default:
		return "application/octet-stream"
	}
}

func handleAssert(c *gin.Context) {
	file := c.Param("file")

	dataPath := getDataPath()
	filePath := filepath.Join(dataPath, "targets/assets", file)
	fmt.Println(filePath)

	content, err := os.ReadFile(filePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "read file error",
		})
		return
	}

	contentType := getContentType(file)
	c.Header("Content-Type", contentType)
	c.Data(http.StatusOK, contentType, content)
}
