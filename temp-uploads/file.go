package main

import (
	"fmt"
)

// Define a struct
type Student struct {
	Name string
	Age  int
	GPA  float64
}

// Method with pointer receiver (to modify the struct)
func (s *Student) SetGPA(gpa float64) {
	s.GPA = gpa
}

// Method with value receiver (just reads data)
func (s Student) GetGPA() float64 {
	return s.GPA
}

// Method to display student info
func (s Student) DisplayInfo() {
	fmt.Printf("Name: %s\n", s.Name)
	fmt.Printf("Age: %d\n", s.Age)
	fmt.Printf("GPA: %.2f\n", s.GPA)
}

func main() {
	// Create a Student object
	s1 := Student{Name: "Adish", Age: 21, GPA: 8.5}

	// Display info
	s1.DisplayInfo()

	// Update GPA
	s1.SetGPA(9.1)
	fmt.Println("\nAfter GPA update:")
	s1.DisplayInfo()
}
