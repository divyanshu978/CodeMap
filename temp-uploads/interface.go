package main

import "fmt"

type shape interface {
	area() float64
}
type rect struct {
	width, height int
}
type Circle struct {
	radius int
}
//both rect and circle type implements shape interface
func (r rect) area() float64 {
	return float64(r.width) * float64(r.height)
}
func (c Circle) area() float64 {
	return 3.14 * float64(c.radius) * float64(c.radius)
}

func test(s shape) {
	switch v := s.(type) { //this chooses the type if it is rect then find that area nor circle area!
	case rect:
		fmt.Printf("the type is rectangle and area is %.2f\n", v.area())
	case Circle:
		fmt.Printf("The type is circle and area is %.2f\n", v.area())
	}
}
func main() {
	test(Circle{
		radius: 12.0,
	})
	fmt.Println("##################################")
	test(rect{
		height: 16,
		width:  12,
	})
}

// ✅ Polished Explanation:
// In Go, interfaces are types that define a collection of method signatures — that is, the behavior a type must implement. They do not define methods based on their output data types, but rather by the method names, parameters, and return types.

// Go interfaces are implemented implicitly, meaning if a type (such as a struct) defines all the methods specified by an interface, it is said to implement that interface automatically — no explicit declaration is required.

// A well-designed interface should have fewer methods, ideally just one. This follows the "Interface Segregation Principle" and is encouraged in Go by the saying:

// "The smaller the interface, the better."

// For example, io.Reader has just one method:

// go
// Copy
// Edit
// Read(p []byte) (n int, err error)
// This makes interfaces more flexible and reusable.

// ✅ Using Interfaces in Functions:
// Interfaces allow polymorphism. If a function accepts an interface type, any concrete type that implements that interface can be passed to the function. This enables flexible and decoupled code.

// Example:

// go
// Copy
// Edit
// type Shape interface {
//     Area() float64
// }

// func PrintArea(s Shape) {
//     fmt.Println("Area:", s.Area())
// }
// Here, any type that has an Area() method returning float64 can be passed to PrintArea().

// ✅ Type Assertion:
// Type assertion is used to retrieve the underlying concrete value from an interface. It’s written as:

// go
// Copy
// Edit
// c, ok := s.(Circle)
// s is of interface type, say Shape

// c will hold the concrete value if s is actually of type Circle

// ok will be true if the assertion succeeds, else false

// This allows us to check and use the actual type stored in an interface.

// ✅ Summary:
// Interfaces define behavior (method signatures).

// Types implement interfaces implicitly by defining those methods.

// Interfaces with fewer methods are preferred for simplicity and flexibility.

// Interfaces enable polymorphism.

// Use type assertion to check or extract the underlying type.
