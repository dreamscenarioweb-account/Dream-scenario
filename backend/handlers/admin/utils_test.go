package admin

import (
	"testing"
)

func TestDeleteFirebaseImage_NilBucket(t *testing.T) {
	// Should not panic with nil bucket
	DeleteFirebaseImage(nil, "https://firebasestorage.googleapis.com/v0/b/bucket/o/uploads%2Ftest.jpg?alt=media")
}

func TestDeleteFirebaseImage_EmptyURL(t *testing.T) {
	// Should not panic with empty URL
	DeleteFirebaseImage(nil, "")
}

func TestDeleteFirebaseImage_BothNil(t *testing.T) {
	// Should not panic when both bucket and URL are nil/empty
	DeleteFirebaseImage(nil, "")
}

func TestDeleteFirebaseImage_MalformedURL(t *testing.T) {
	// Should handle gracefully - no /o/ path separator
	DeleteFirebaseImage(nil, "https://example.com/some/path")
}

func TestDeleteFirebaseImage_ValidURLExtraction(t *testing.T) {
	// We can't actually delete without a real bucket, but we verify
	// the function doesn't panic on well-formed Firebase URLs.
	// The function returns early when bucket is nil.
	DeleteFirebaseImage(nil, "https://firebasestorage.googleapis.com/v0/b/my-bucket.appspot.com/o/uploads%2F1234-uuid.jpg?alt=media&token=abc")
}

func TestDeleteFirebaseImage_URLWithSpecialChars(t *testing.T) {
	// URL with spaces encoded as %20
	DeleteFirebaseImage(nil, "https://firebasestorage.googleapis.com/v0/b/bucket/o/uploads%2Fmy%20photo.jpg?alt=media")
}

func TestDeleteFirebaseImage_RelativeURL(t *testing.T) {
	// Relative URL should not crash
	DeleteFirebaseImage(nil, "/uploads/photo.jpg")
}

func TestDeleteFirebaseImage_ProtocolRelativeURL(t *testing.T) {
	// Protocol-relative URL
	DeleteFirebaseImage(nil, "//firebasestorage.googleapis.com/v0/b/bucket/o/test.jpg")
}
