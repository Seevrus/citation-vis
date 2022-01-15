/* eslint-disable @typescript-eslint/no-use-before-define */
import * as d3 from 'd3';
import { sort } from 'ramda';
import { useEffect, useRef, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import {
  selectAuthorsList,
  setArticleList,
  setAuthorsList,
  setSelectedArticleId,
} from '../../store/citations/citations';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import CardWrapper from '../cards/CardWrapper';

import './bar.css';

const Bar = () => {
  const dispatch = useAppDispatch();

  const [imgHeight, setImgHeight] = useState(800);
  const [sortByName, setSortByName] = useState(false);
  const imgWidth = 960;
  const margin = {
    top: 50,
    bottom: 50,
    left: 150,
    right: 10,
  };
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const authorData = useAppSelector(selectAuthorsList);
  const colors = d3.scaleOrdinal(d3.schemeCategory10);

  useEffect(
    () => {
      dispatch(setSelectedArticleId(null));
    },
    [dispatch],
  );

  useEffect(
    () => {
      if (!authorData) {
        dispatch(setAuthorsList());
      }
    },
    [authorData, dispatch],
  );

  useEffect(
    () => {
      const svgEl = d3.select(svgRef.current);

      if (authorData) {
        const sortedAuthorData = sort((a1, a2) => {
          if (sortByName) {
            return a1.surName.localeCompare(a2.surName);
          }
          return a2.citations - a1.citations;
        }, authorData);

        setImgHeight(sortedAuthorData.length * 20);
        const maxCitations = sortedAuthorData.reduce(
          (prev, author) => author.citations > prev ? author.citations : prev,
          0,
        );
        const xScale = d3.scaleLog()
          .domain([1, maxCitations])
          .range([0, imgWidth - margin.left - margin.right]);
        const yScale = d3.scaleBand()
          .domain(sortedAuthorData.map(
            (author) => `${author.surName ?? ''}, ${author.givenName ?? ''}`),
          )
          .range([0, imgHeight - margin.top - margin.bottom])
          .padding(0.2);

        svgEl.selectAll('*').remove();
        d3.select('#bar-container').on('click', onMouseClick);

        const body = svgEl
          .append('g')
          .style('transform', `translate(${margin.left}px, ${margin.top}px)`);
        
        const tooltip = d3.select(tooltipRef.current)
          .html('')
          .append('div')
          .attr('class', 'tooltip-bar')
          .style('opacity', 0);

        const bars = body
          .selectAll('.bar')
          .data(sortedAuthorData);
        
        bars
          .enter()
          .append('rect')
          .attr('height', yScale.bandwidth())
          .attr('y', d => yScale(`${d.surName ?? ''}, ${d.givenName ?? ''}`))
          .attr('width', d => xScale(d.citations || 0))
          .attr('fill', d => colors(d.level))
          .on('mouseover', onMouseOver)
          .on('mouseout', onMouseOut);
        
        const axisTop = d3.axisTop(xScale).ticks(10);
        const axisBottom = d3.axisBottom(xScale).ticks(10);
        svgEl
          .append('g')
          .style('transform', `translate(${margin.left}px, ${margin.top}px)`)
          .call(axisTop);
        svgEl
          .append('g')
          .style('transform', `translate(${margin.left}px, ${imgHeight - margin.bottom}px)`)
          .call(axisBottom);
        
        const axisY = d3.axisLeft(yScale);
        svgEl
          .append('g')
          .style('transform', `translate(${margin.left}px, ${margin.top}px)`)
          .call(axisY);
        
        function onMouseOver(d) {
          d3.select(this).transition().duration('50').attr('opacity', '.6');
          tooltip.transition().duration(50).style('opacity', '1');
          tooltip.html(d.target.__data__.citations)
            .style('left', (d.pageX + 10) + 'px')
            .style('top', (d.pageY - 15) + 'px');
        }
  
        function onMouseOut() {
          d3.select(this).transition().duration('50').attr('opacity', '1');
          tooltip.html('').style(null);
          tooltip.transition().duration(50).style('opacity', '0');
        }

        function onMouseClick(e) {
          if (e.target.nodeName === 'rect') {
            const authorId = e.target.__data__.authorId;
            if (!authorId) return;
            dispatch(setArticleList({
              listType: 'author',
              keyword: authorId,
            }));
            dispatch(setSelectedArticleId(null));

            bars.select('rect').style('stroke', 'purple');
            d3.select(e.target).style('stroke', 'black');
          } else if (e.target.nodeName === 'text') {
            tooltip.html('').style(null);
            tooltip.transition().duration(50).style('opacity', '0');
            setSortByName(!sortByName);
          } else if (e.target.nodeName !== 'text') {
            dispatch(setArticleList(null));
            dispatch(setSelectedArticleId(null));

            d3.selectAll('circle').style('stroke', d3.rgb(colors(0)).darker());
          }
        }
      }
    },
    [
      authorData,
      colors,
      dispatch,
      imgHeight,
      margin.bottom, margin.left, margin.right, margin.top,
      sortByName,
    ],
  );

  return (
    <Container fluid>
      <Row>
        <Col lg={8}>
          <svg ref={svgRef} width={imgWidth} height={imgHeight} id="bar-container" />
        </Col>
        <CardWrapper />
      </Row>
      <div ref={tooltipRef}></div>
    </Container>
  );
};

export default Bar;
