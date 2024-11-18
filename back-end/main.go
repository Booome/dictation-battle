package main

import (
	"database/sql"
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
	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/exp/slices"
)

const HOST = "0.0.0.0:8041"

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

func getTargetList() ([]string, error) {
	dataPath := getDataPath()

	files, err := os.ReadDir(filepath.Join(dataPath, "targets"))
	if err != nil {
		return nil, err
	}

	result := make([]string, 0)
	for _, file := range files {
		if filepath.Ext(file.Name()) == ".md" {
			result = append(result, strings.TrimSuffix(file.Name(), ".md"))
		}
	}

	return result, nil
}

type Server struct {
	db     *sql.DB
	engine *gin.Engine
}

func NewServer() *Server {
	dataPath := getDataPath()
	if _, err := os.Stat(dataPath); os.IsNotExist(err) {
		log.Fatal("dataPath not exist")
	}

	db, err := sql.Open("sqlite3", filepath.Join(dataPath, "data.db"))
	if err != nil {
		log.Fatal("Open database error:", err)
	}

	ge := gin.Default()

	server := Server{db, ge}
	server.initDB()
	server.initEngine()

	return &server
}

func (s *Server) Run() error {
	return s.engine.Run(HOST)
}

func (s *Server) Close() error {
	return s.db.Close()
}

func (s *Server) initEngine() {
	frontendUrl := os.Getenv("FRONTEND_URL")
	if frontendUrl == "" {
		log.Fatal("FRONTEND_URL is not set")
	}

	s.engine.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://127.0.0.1:*", "http://localhost:*", frontendUrl},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	s.engine.GET("/targets/preview", s.handleGetPreview)
	s.engine.GET("/targets/:id", s.handleGetTarget)
	s.engine.GET("/assets/:file", s.handleGetAssert)
	s.engine.GET("/favorites", s.handleGetFavorites)
	s.engine.POST("/favorites", s.handleSetFavorites)
}

func (s *Server) initDB() {
	query := "SELECT name FROM sqlite_master WHERE type='table' AND name='favorite'"
	row := s.db.QueryRow(query)
	var tableName string
	err := row.Scan(&tableName)
	if err != nil {
		query = "CREATE TABLE favorite (account TEXT PRIMARY KEY, targets TEXT)"
		_, err = s.db.Exec(query)
		if err != nil {
			log.Fatal("Create favorite table error:", err)
		}
	}
}

func (s *Server) handleGetPreview(c *gin.Context) {
	count, err := strconv.Atoi(c.Query("count"))
	if err != nil || count <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "count is required",
		})
		return
	}

	targets, err := getTargetList()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "get target list error",
		})
		return
	}

	rand.Shuffle(len(targets), func(i, j int) {
		targets[i], targets[j] = targets[j], targets[i]
	})

	if count > len(targets) {
		count = len(targets)
	}

	c.JSON(http.StatusOK, targets[:count])
}

func (s *Server) handleGetTarget(c *gin.Context) {
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

func (s *Server) handleGetAssert(c *gin.Context) {
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

func (s *Server) getFavoriteTargets(account string) []string {
	targets, err := getTargetList()
	if err != nil {
		return []string{}
	}

	query := "SELECT targets FROM favorite WHERE account = ?"
	row := s.db.QueryRow(query, account)
	var targetsStr string
	err = row.Scan(&targetsStr)
	if err != nil {
		return []string{}
	}

	result := make([]string, 0)
	for _, target := range strings.Split(targetsStr, ",") {
		if slices.Contains(targets, target) {
			result = append(result, target)
		}
	}

	return result
}

func (s *Server) handleGetFavorites(c *gin.Context) {
	account := c.Query("account")
	targets := s.getFavoriteTargets(account)
	c.JSON(http.StatusOK, targets)
}

func (s *Server) handleSetFavorites(c *gin.Context) {
	var req struct {
		Account string `json:"account"`
		Target  string `json:"target"`
		Value   bool   `json:"value"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request body",
		})
		return
	}

	targets := s.getFavoriteTargets(req.Account)

	found := false
	if req.Value {
		for _, t := range targets {
			if t == req.Target {
				found = true
				break
			}
		}
		if !found {
			targets = append(targets, req.Target)
		}
	} else {
		newTargets := make([]string, 0)
		for _, t := range targets {
			if t != req.Target {
				newTargets = append(newTargets, t)
			}
		}
		targets = newTargets
	}

	newTargetsStr := strings.Join(targets, ",")
	_, err := s.db.Exec("REPLACE INTO favorite (account, targets) VALUES (?, ?)",
		req.Account, newTargetsStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "database error",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "success",
	})
}

func main() {
	godotenv.Load()

	server := NewServer()
	defer server.Close()

	if err := server.Run(); err != nil {
		log.Fatal("Run server error:", err)
	}
}
