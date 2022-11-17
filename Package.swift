// swift-tools-version:5.3
// The swift-tools-version declares the minimum version of Swift required to build this package.
import PackageDescription

let package = Package(
    name: "PrivacyReferenceTests",
    products: [
        .library(
            name: "PrivacyReferenceTests",
            targets: ["PrivacyReferenceTests"]),
    ],
    dependencies: [
    ],
    targets: [
        .target(
            name: "PrivacyReferenceTests",
            path: ".",
            resources: [
                .copy("."),
            ]
        ),
    ]
)
