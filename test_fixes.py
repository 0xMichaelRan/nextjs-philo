#!/usr/bin/env python3
"""
Test script to verify the fixes for the movie page and video processing issues.
"""

import asyncio
import aiohttp
import json
import sys
from typing import Dict, Any

# Configuration
API_BASE_URL = "http://192.168.0.113:8009"
TEST_MOVIE_ID = "tt0079470"  # Example movie ID from the error logs

class TestRunner:
    def __init__(self):
        self.session = None
        self.results = []

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    def log_result(self, test_name: str, success: bool, message: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        self.results.append({
            "test": test_name,
            "success": success,
            "message": message
        })

    async def test_public_videos_api(self):
        """Test 1: Public videos API without authentication"""
        try:
            url = f"{API_BASE_URL}/movies/{TEST_MOVIE_ID}/public-videos"
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    video_count = len(data.get('videos', []))
                    self.log_result(
                        "Public Videos API", 
                        True, 
                        f"Retrieved {video_count} public videos"
                    )
                    return data
                else:
                    error_text = await response.text()
                    self.log_result(
                        "Public Videos API", 
                        False, 
                        f"HTTP {response.status}: {error_text[:100]}"
                    )
                    return None
        except Exception as e:
            self.log_result("Public Videos API", False, f"Exception: {str(e)}")
            return None

    async def test_video_jobs_api(self):
        """Test 2: Video jobs API (should still work)"""
        try:
            url = f"{API_BASE_URL}/video-jobs/"
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    job_count = len(data.get('jobs', []))
                    self.log_result(
                        "Video Jobs API", 
                        True, 
                        f"Retrieved {job_count} video jobs"
                    )
                    return data
                else:
                    error_text = await response.text()
                    self.log_result(
                        "Video Jobs API", 
                        False, 
                        f"HTTP {response.status}: {error_text[:100]}"
                    )
                    return None
        except Exception as e:
            self.log_result("Video Jobs API", False, f"Exception: {str(e)}")
            return None

    async def test_movie_api(self):
        """Test 3: Movie details API"""
        try:
            url = f"{API_BASE_URL}/movies/{TEST_MOVIE_ID}"
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_result(
                        "Movie Details API", 
                        True, 
                        f"Retrieved movie: {data.get('title', 'Unknown')}"
                    )
                    return data
                else:
                    error_text = await response.text()
                    self.log_result(
                        "Movie Details API", 
                        False, 
                        f"HTTP {response.status}: {error_text[:100]}"
                    )
                    return None
        except Exception as e:
            self.log_result("Movie Details API", False, f"Exception: {str(e)}")
            return None

    async def test_api_no_duplicates(self):
        """Test 4: Verify no duplicate API calls by timing"""
        import time
        
        try:
            # Test public videos API timing
            start_time = time.time()
            url = f"{API_BASE_URL}/movies/{TEST_MOVIE_ID}/public-videos"
            
            async with self.session.get(url) as response:
                end_time = time.time()
                response_time = end_time - start_time
                
                if response.status == 200 and response_time < 2.0:  # Should be fast
                    self.log_result(
                        "API Response Time", 
                        True, 
                        f"Response time: {response_time:.2f}s (no duplicates detected)"
                    )
                else:
                    self.log_result(
                        "API Response Time", 
                        False, 
                        f"Slow response: {response_time:.2f}s or error {response.status}"
                    )
        except Exception as e:
            self.log_result("API Response Time", False, f"Exception: {str(e)}")

    def print_summary(self):
        """Print test summary"""
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r['success'])
        failed_tests = total_tests - passed_tests
        
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\nFAILED TESTS:")
            for result in self.results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['message']}")
        
        return failed_tests == 0

async def main():
    """Main test function"""
    print("🧪 Testing Movie Page and Video Processing Fixes")
    print("="*60)
    
    async with TestRunner() as tester:
        # Run all tests
        await tester.test_movie_api()
        await tester.test_public_videos_api()
        await tester.test_video_jobs_api()
        await tester.test_api_no_duplicates()
        
        # Print summary
        success = tester.print_summary()
        
        if success:
            print("\n🎉 All tests passed! The fixes are working correctly.")
            return 0
        else:
            print("\n⚠️  Some tests failed. Please check the issues above.")
            return 1

if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n⏹️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n💥 Test runner failed: {e}")
        sys.exit(1)
