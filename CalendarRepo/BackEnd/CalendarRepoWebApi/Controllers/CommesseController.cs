using CalendarRepo.Dto.Auth;
using CalendarRepo.Migrations;
using CalendarRepo.Models;
using CalendarRepo.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace CalendarRepo.Controllers
{
    [ApiController]
    [Route("api/commesse")]
    public class CommesseController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        public CommesseController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        [Route("get")]
        [Authorize]
        public IActionResult GetCommesse()
        {
            try
            {
                return Ok(_unitOfWork.Commesse.GetAll());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        [Route("addFromJson")]
        [Authorize]
        public async Task<IActionResult> AddFromJson([FromBody] List<Commessa> commesse)
        {
            try
            {
                await _unitOfWork.Commesse.AddRangeAsync(commesse);
                await _unitOfWork.CompleteAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpPost]
        [Route("add")]
        [Authorize]
        public async Task<IActionResult> AddCommessa([FromBody] Commessa commessa)
        {
            try
            {
                await _unitOfWork.Commesse.AddAsync(commessa);
                await _unitOfWork.CompleteAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut]
        [Route("update")]
        [Authorize]
        public async Task<IActionResult> UpdateCommessa([FromBody] Commessa commessa)
        {
            try
            {
                _unitOfWork.Commesse.Update(commessa);
                await _unitOfWork.CompleteAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete]
        [Route("delete/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteCommessa(int id)
        {
            try
            {
                var commessa = await _unitOfWork.Commesse.GetByIdAsync(id);
                _unitOfWork.Commesse.Delete(commessa);
                await _unitOfWork.CompleteAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
