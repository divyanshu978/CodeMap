package main

import "fmt"

// add function
func add(a, b int) int {
	return a + b
}

func main() {
	fmt.Println("Sum:", add(2, 3))
}
