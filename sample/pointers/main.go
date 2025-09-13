package main

import (
	"fmt"
	"golang/add"
)
func main() {

	fmt.Println("lets learn Pointers in Go")
	x := 5
	y := &x
	fmt.Println(*y)
	*y = 6
	fmt.Println(x)
	fmt.Println(add.Add(x,*y))
	// everytime deferencing pointers must check whether it is not nil bcoz if it is nil then it creates panic!/error!
}
