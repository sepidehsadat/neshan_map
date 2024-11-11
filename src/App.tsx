import { useEffect, useRef, useState } from "react"
import "@neshan-maps-platform/react-openlayers/dist/style.css"
import NeshanMap, { NeshanMapRef, OlMap, Ol } from "@neshan-maps-platform/react-openlayers"

function App() {
  const mapRef = useRef<NeshanMapRef | null>(null)
  const [ol, setOl] = useState<Ol>()
  const [olMap, setOlMap] = useState<OlMap>()
  const [markers, setMarkers] = useState<any[]>([])
  const [coordinatesList, setCoordinatesList] = useState<[number, number][]>([])
  const [apiResponse, setApiResponse] = useState<any>(null)

  const onInit = (ol: any, map: any) => {
    setOl(ol)
    setOlMap(map)

    map.on("click", (event: any) => {
      const coordinates = event.coordinate
      const lonLat = ol.proj.toLonLat(coordinates) as [number, number]
      setCoordinatesList((prev) => [...prev, lonLat])

      setMarkers((prevMarkers) => {
        const markerNumber = prevMarkers.length + 1 // شماره مارکر بر اساس طول جدید آرایه
        const newMarker = new ol.Feature({
          geometry: new ol.geom.Point(coordinates),
        })

        newMarker.setStyle(new ol.style.Style({
          image: new ol.style.Icon({
            src: "https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png",
            scale: 0.5,
          }),
          text: new ol.style.Text({
            text: markerNumber.toString(),
            offsetY: -25, // موقعیت متن نسبت به آیکون
            scale: 1.2,
            fill: new ol.style.Fill({ color: "#000" }),
            stroke: new ol.style.Stroke({ color: "#fff", width: 2 })
          })
        }))

        const vectorSource = new ol.source.Vector({
          features: [newMarker],
        })
        const markerLayer = new ol.layer.Vector({
          source: vectorSource,
        })
        map.addLayer(markerLayer)

        return [...prevMarkers, newMarker] // افزودن مارکر جدید به آرایه
      })
    })
  }

  const formattedCoordinates = coordinatesList
    .map(coord => `${coord[1]},${coord[0]}`)
    .join("%7C")

  const sendRequest = async () => {
    const apiKey = "service.fc4551c901e9408180752c90ca15643e"
    const url = `https://api.neshan.org/v3/trip?waypoints=${formattedCoordinates}&roundTrip=true&sourceIsAnyPoint=true&lastIsAnyPoint=true`

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Api-Key": apiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setApiResponse(data)
    } catch (error) {
      console.error("Request failed:", error)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (mapRef.current?.map) {
        mapRef.current?.map.setMapType("standard-night")
        clearInterval(interval)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <NeshanMap
        mapKey="web.e856f8c2d4c6494e848e31a4035c15a4"
        defaultType="neshan"
        center={{ latitude: 35.7665394, longitude: 51.4749824 }}
        style={{ height: "100%", width: "100%" }}
        onInit={onInit}
        zoom={13}
      />
      <button onClick={sendRequest}>ارسال درخواست به API</button>
      <div>
        <h3>پاسخ API:</h3>
        <pre>{apiResponse ? JSON.stringify(apiResponse, null, 2) : "پاسخی دریافت نشده"}</pre>
      </div>
    </>
  )
}

export default App
